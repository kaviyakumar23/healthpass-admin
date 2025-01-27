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
  const logout = useStore((state) => state.logout);

  const handleScan = (data) => {
    if (data) {
      setScanning(false);
      // Simulate document verification
      // In real implementation, this would validate the QR data against a backend
      try {
        const documentData = JSON.parse(data.text);
        setScanResult(documentData);
      } catch (error) {
        setScanResult({ status: "invalid", message: "Invalid QR Code" });
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
                  onScan={(result) => console.log(result)}
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
                {scanResult?.status === "approved" ? (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <AlertTitle className="text-green-500">
                      Documents Verified
                    </AlertTitle>
                    <p className="mt-2">
                      All travel documents have been verified. Traveler is
                      cleared for entry.
                    </p>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
