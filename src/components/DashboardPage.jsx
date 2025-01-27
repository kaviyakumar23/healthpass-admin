import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import useStore from "../store/useStore";
import { Button } from "./ui/button";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Alert, AlertTitle } from "./ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

export function DashboardPage() {
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const logout = useStore((state) => state.logout);

  const handleScan = async (data) => {
    if (data) {
      setScanning(false);
      setIsLoading(true);
      try {
        // Extract envelopeId from URL query parameters
        const qrUrl = new URL(data[0].rawValue);
        const envelopeId = qrUrl.searchParams.get("envelopeId");

        if (!envelopeId) {
          throw new Error("Invalid QR code: Missing envelopeId");
        }

        // Make request to backend endpoint
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/envelopes/${envelopeId}/status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch document status");
        }

        const documentData = await response.json();

        // Process the response data
        setScanResult({
          status: documentData.status === "completed" ? "approved" : "invalid",
          documentId: documentData.envelopeId,
          expiryDate: documentData.expireDateTime,
          travelerName: documentData.sender.userName,
          message:
            documentData.status === "completed"
              ? "Document verified successfully"
              : "Document verification failed",
        });
      } catch (error) {
        console.error("Error:", error);
        setScanResult({
          status: "invalid",
          message: "Failed to verify document. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const handleNewScan = () => {
    setScanning(true);
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">HealthPass Verification Portal</h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Document Verification</h2>
          </CardHeader>
          <CardContent>
            {scanning ? (
              <div className="space-y-4">
                <Scanner
                  onScan={(result) => handleScan(result)}
                  onError={handleError}
                  scanDelay={300}
                  styles={{ width: "100%" }}
                />
                <p className="text-center text-muted-foreground">
                  Please scan a traveler's QR code
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Verifying document...
                    </p>
                  </div>
                ) : (
                  <>
                    {scanResult?.status === "approved" ? (
                      <Alert className="border-green-500 bg-green-50">
                        <div className="flex flex-col items-center space-y-4 w-full">
                          <CheckCircle2 className="h-16 w-16 text-green-500" />
                          <AlertTitle className="text-green-500 text-xl font-semibold">
                            Documents Verified
                          </AlertTitle>
                          <div className="text-center space-y-3 w-full">
                            <p className="text-green-700">
                              All travel documents have been verified. Traveler
                              is cleared for entry.
                            </p>
                            <div className="bg-white rounded-lg p-4 shadow-sm max-w-md mx-auto">
                              <dl className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <dt className="text-gray-500">Traveler</dt>
                                  <dd className="font-medium">
                                    {scanResult.travelerName}
                                  </dd>
                                </div>
                                <div className="flex justify-between items-center">
                                  <dt className="text-gray-500">Document ID</dt>
                                  <dd className="font-medium">
                                    {scanResult.documentId}
                                  </dd>
                                </div>
                                <div className="flex justify-between items-center">
                                  <dt className="text-gray-500">Expires</dt>
                                  <dd className="font-medium">
                                    {new Date(
                                      scanResult.expiryDate
                                    ).toLocaleDateString()}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </Alert>
                    ) : (
                      <Alert className="border-red-500 bg-red-50">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <AlertTitle className="text-red-500">
                          Verification Failed
                        </AlertTitle>
                        <p className="mt-2">
                          {scanResult?.message ||
                            "Documents could not be verified."}
                        </p>
                      </Alert>
                    )}
                    <Button onClick={handleNewScan} className="w-full">
                      Scan New Document
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
