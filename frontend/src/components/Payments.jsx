import React from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../api/config";

// Replace this with your UPI ID and QR image path
const UPI_ID = "9745325772@slice";
const QR_IMAGE = "/slice.jpg"; // ✅ just use '/slice.jpg', not '/public/slice.jpg'

const themeColors = {
  bg: "#0a1128",
  card: "#142136",
  primary: "#2979ff",
  hover: "#5393ff",
  text: "#e0e0e0",
};

const Payments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSendingScreenshot, setIsSendingScreenshot] = React.useState(false);
  const [screenshotSent, setScreenshotSent] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = React.useState(null);
  const [screenshotPreview, setScreenshotPreview] = React.useState(null);
  const pollingIntervalRef = React.useRef(null);

  const amount = location.state?.amount || 0;
  const passengers = location.state?.passengers || 1;
  const bookingId = location.state?.bookingId;

  
  // Cleanup polling interval on component unmount
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        console.log('Polling cleanup: Cleared interval on component unmount');
      }
    };
  }, []);

  const handleSendScreenshot = async () => {
    if (!bookingId) {
      alert("No booking ID found. Please try again.");
      return;
    }

    if (!screenshotPreview) {
      alert("Please upload a payment screenshot first.");
      return;
    }

    setIsSendingScreenshot(true);
    try {
      console.log('=== SENDING SCREENSHOT ===');
      console.log('Booking ID:', bookingId);
      console.log('Screenshot size:', screenshotPreview.length, 'bytes');
      
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/screenshot`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentScreenshot: screenshotPreview,
        }),
      });

      console.log('Screenshot upload response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Screenshot upload error:', errorData);
        throw new Error(errorData.error || "Failed to send screenshot.");
      }

      const data = await res.json();
      console.log('Screenshot sent successfully');
      console.log('Response has paymentScreenshot:', !!data.paymentScreenshot);
      
      setScreenshotSent(true);
      alert("✓ Screenshot sent successfully! The admin can now view it. Waiting for admin confirmation...");
      
      // Start polling to check if admin has confirmed the payment
      startPolling();
    } catch (err) {
      console.error('Screenshot send error:', err);
      alert("Failed to send screenshot: " + err.message);
    } finally {
      setIsSendingScreenshot(false);
    }
  };

  const startPolling = () => {
    setIsPolling(true);
    console.log('Starting to poll for payment confirmation...');
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch booking status");
        }

        const booking = await res.json();
        console.log('Polling check - Booking status:', booking.status);

        if (booking.status === 'confirmed') {
          console.log('Payment confirmed by admin!');
          clearInterval(pollingIntervalRef.current);
          setIsPolling(false);
          
          alert("✓ Payment Confirmed! Your booking has been verified by the admin. Redirecting...");
          setTimeout(() => {
            navigate("/h", { replace: true });
          }, 2000);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleBackToHome = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    navigate("/h", { replace: true });
  };



  const handlePay = () => {
    const link = `upi://pay?pa=${UPI_ID}&pn=Adnan%20T%20S&am=${amount}&cu=INR`;
    window.open(link);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB. Please choose a smaller image.");
        return;
      }

      setPaymentScreenshot(file);

      // Convert to base64 for preview and storage with compression
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        console.log('Screenshot original base64 size:', base64String.length, 'bytes');
        
        // If image is too large, try to compress it
        if (base64String.length > 2 * 1024 * 1024) {
          console.log('Image is large, attempting compression...');
          compressImage(base64String);
        } else {
          setScreenshotPreview(base64String);
          console.log('Screenshot ready, size:', base64String.length, 'bytes');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (base64String) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Reduce image size to 80% quality
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Try different quality levels
      let quality = 0.8;
      let compressed = canvas.toDataURL('image/jpeg', quality);
      
      while (compressed.length > 2 * 1024 * 1024 && quality > 0.3) {
        quality -= 0.1;
        compressed = canvas.toDataURL('image/jpeg', quality);
      }
      
      console.log('Compressed screenshot size:', compressed.length, 'bytes');
      setScreenshotPreview(compressed);
    };
    img.src = base64String;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: themeColors.bg,
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          background: themeColors.card,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>
          Complete Your Payment
        </Typography>
        <Typography variant="h6" sx={{ color: themeColors.text, mb: 3 }}>
          Total for {passengers} passenger(s): ₹{amount}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <img src={QR_IMAGE} alt="UPI QR" style={{ width: 200, height: 300, borderRadius: 8 }} />
        </Box>

        <Typography sx={{ mt: 3, color: "rgba(255, 255, 255, 1)", fontWeight: "bold" }}>
          1. Scan QR to pay
        </Typography>
        <Typography sx={{ mt: 1, mb: 3, color: "rgba(255, 255, 255, 1)", fontWeight: "bold" }}>
          2. Upload payment screenshot
        </Typography>

        {/* Screenshot Upload Section */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: "2px dashed",
            borderColor: screenshotPreview ? themeColors.primary : "rgba(255, 255, 255, 0.3)",
            borderRadius: 2,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: themeColors.primary,
              backgroundColor: "rgba(41, 121, 255, 0.1)",
            },
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleScreenshotChange}
            style={{ display: "none" }}
            id="screenshot-input"
          />
          <label htmlFor="screenshot-input" style={{ cursor: "pointer", display: "block" }}>
            {screenshotPreview ? (
              <Box>
                <img
                  src={screenshotPreview}
                  alt="Payment Screenshot Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                />
                <Typography sx={{ color: themeColors.primary, fontWeight: "bold" }}>
                  ✓ Screenshot uploaded
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography sx={{ color: themeColors.text, mb: 1 }}>
                  📸 Click to upload payment screenshot
                </Typography>
                <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem" }}>
                  (PNG, JPG, JPEG - Max 5MB)
                </Typography>
              </Box>
            )}
          </label>
        </Box>

        <Typography sx={{ mt: 1, mb: 3, color: "rgba(255, 255, 255, 1)", fontWeight: "bold" }}>
          3. Send the screenshot.
        </Typography>

        <Stack spacing={2}>
          <Button
            onClick={handleSendScreenshot}
            disabled={!screenshotPreview || isSendingScreenshot || screenshotSent}
            sx={{
              background: screenshotSent ? "#4caf50" : themeColors.primary,
              color: "#fff",
              width: "100%",
              py: 1.5,
              fontWeight: "bold",
              "&:hover": { background: screenshotSent ? "#66bb6a" : themeColors.hover },
              opacity: !screenshotPreview ? 0.6 : 1,
            }}
          >
            {isSendingScreenshot ? "Sending..." : screenshotSent ? "✓ Screenshot Sent" : "Send Screenshot"}
          </Button>

          {!screenshotSent && (
            <Typography
              sx={{
                color: "#ffb74d",
                fontSize: "0.9rem",
                textAlign: "center",
                py: 1,
              }}
            >
              {isPolling ? "⏳ Waiting for admin confirmation..." : "⬆ Upload and send screenshot to proceed"}
            </Typography>
          )}

          {screenshotSent && (
            <Typography
              sx={{
                color: "#66bb6a",
                fontSize: "0.9rem",
                textAlign: "center",
                py: 1,
              }}
            >
              {isPolling ? "✓ Screenshot sent. Admin is reviewing your payment..." : "✓ Screenshot sent successfully"}
            </Typography>
          )}

          <Button
            onClick={handleBackToHome}
            sx={{
              background: "#2979ff",
              color: "#fff",
              width: "100%",
              py: 1.5,
              fontWeight: "bold",
              "&:hover": { background: "#5393ff" },
            }}
          >
            Back to Home
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Payments;
