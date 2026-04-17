# Payment Polling Implementation Summary

## Overview
This document describes the implementation of async payment confirmation with real-time polling. Users can now submit payment screenshots and wait for admin approval with live status updates.

## User Workflow

### 1. Payment Screenshot Submission (Payments.jsx)
**File:** `frontend/src/components/Payments.jsx`

**Steps:**
1. User scans UPI QR code to make payment
2. User uploads payment screenshot (auto-compresses if >2MB)
3. User clicks "Send Screenshot" button
4. Screenshot is sent to backend via PATCH `/api/bookings/{bookingId}/screenshot`
5. Polling starts automatically after successful upload

**Key Features:**
- Image compression (JPEG, 80% quality baseline, reduces to 30% if needed)
- File size validation (max 5MB)
- Base64 encoding for transmission
- Auto-retry with lower quality if too large
- Clear status messages for user

**Component State:**
```javascript
const [isSendingScreenshot, setIsSendingScreenshot] = useState(false);
const [screenshotSent, setScreenshotSent] = useState(false);
const [isPolling, setIsPolling] = useState(false);
const [paymentScreenshot, setPaymentScreenshot] = useState(null);
const [screenshotPreview, setScreenshotPreview] = useState(null);
const pollingIntervalRef = useRef(null);
```

### 2. Real-Time Status Polling (Payments.jsx)

**Polling Function:** `startPolling()`
- Fetches booking status every 3 seconds
- Endpoint: `GET /api/bookings/{bookingId}`
- Checks if booking status is 'confirmed'
- Auto-stops polling when admin confirms
- Shows alert and navigates to home on confirmation
- Cleans up interval on unmount to prevent memory leaks

**Polling Interval:** 3000ms (3 seconds)

**Status Messages:**
- Before screenshot sent: "⬆ Upload and send screenshot to proceed"
- After screenshot sent: "✓ Screenshot sent successfully"
- During polling: "⏳ Waiting for admin confirmation..."
- When confirmed: "✓ Payment Confirmed! Your booking has been verified by the admin. Redirecting..."

### 3. Back to Home Navigation
- Users can click "Back to Home" button anytime
- Button clears polling interval to prevent memory leaks
- Navigates to home page via React Router

---

## Admin Workflow

### Admin Payment Verification (Admin.jsx)
**File:** `frontend/src/components/Admin.jsx`

**Steps:**
1. Admin views all pending bookings
2. Admin clicks "View" button to see payment screenshot in modal
3. Screenshot is marked as "viewed" in component state
4. Admin clicks "Confirm" button to approve payment
5. Backend updates booking status to 'confirmed'
6. User's polling detects status change and shows confirmation

**Admin Features:**
- Screenshot modal viewer with full-size preview
- Screenshot verification requirement (must view before confirming)
- Viewed status tracking per screenshot
- Disable "Confirm" button until screenshot viewed
- Error handling for missing screenshots

---

## Backend API Endpoints

### 1. Screenshot Upload Endpoint
**POST/PATCH** `/api/bookings/{bookingId}/screenshot`

**Request:**
```json
{
  "paymentScreenshot": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "_id": "booking_id",
  "status": "pending",
  "paymentScreenshot": "data:image/jpeg;base64,...",
  ...
}
```

### 2. Polling Status Endpoint
**GET** `/api/bookings/{bookingId}`

**Response:**
```json
{
  "_id": "booking_id",
  "search": "Bangalore to Mumbai",
  "date": "2024-01-15",
  "passengers": 2,
  "status": "pending|confirmed",
  "hasScreenshot": true,
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:05:00Z"
}
```

**Purpose:** Client polling endpoint to check if admin has confirmed payment

### 3. Confirmation Endpoint
**PATCH** `/api/bookings/{bookingId}/confirm`

**Effect:** 
- Updates booking status to 'confirmed'
- Triggered by admin panel
- Returns updated booking object

---

## Implementation Details

### File Modifications

#### 1. frontend/src/components/Payments.jsx
- Added `isPolling` state for tracking polling status
- Added `pollingIntervalRef` for interval management
- Added `handleBackToHome()` function with cleanup
- Added `startPolling()` function for status checking
- Added `React.useEffect()` for cleanup on unmount
- Removed `handleConfirmPayment()` (no longer user-initiated)
- Removed `handleCancel()` function
- Updated button section with "Back to Home" instead of "Confirm/Cancel"
- Added status indicator messages during polling

#### 2. backend/routes/bookings.js
- Added new GET endpoint: `/api/bookings/:id` for polling status
- Returns booking with status field for client-side checking
- Includes logging for debugging polling requests
- Placed after generic routes to avoid conflicts

#### 3. No changes to Booking.js
- Model already supports `paymentScreenshot` field
- Status field already supports 'pending' and 'confirmed' states

#### 4. No changes to Admin.jsx
- Already has screenshot verification logic
- Already confirms bookings via PATCH `/confirm` endpoint
- Works seamlessly with polling mechanism

---

## Data Flow Diagram

```
USER SIDE                          BACKEND                          ADMIN SIDE
─────────────────────────────────────────────────────────────────────────────

Upload Screenshot
        │
        ├─→ POST/PATCH /screenshot ────→ Save base64 screenshot
        │                                 to MongoDB
        │
        ├─ Screenshot Sent! ←─────────── 200 OK
        │
        ├─ Start Polling
        │   (every 3 sec)
        │
        └─→ GET /bookings/:id ────────────→ Check booking status
            Loop until                      (returns "pending" or "confirmed")
            confirmed
                                           ┌──────────────────┐
                                           │ ADMIN PANEL      │
                                           │ ────────────── │
                                           │ View Screenshot │
                                           │ Mark as Viewed  │
                                           │ Click Confirm   │
                                           └──────────────────┘
                                                    │
                                                    ↓
                                           PATCH /confirm
                                           Status = "confirmed"
                                                    │
                ┌─ Status = "confirmed" ←─────────┘
                │
                ├─ Show Alert
                │ "Payment Confirmed!"
                │
                └─ Navigate to Home
```

---

## Error Handling

### Client-Side
- Screenshot not uploaded: Alert user to upload before sending
- Network error: Catch and log polling errors (non-blocking)
- Component unmount: Clear interval to prevent memory leaks
- Booking not found: Polling error caught but doesn't break flow

### Server-Side
- Invalid booking ID: Return 404 "Booking not found"
- Database error: Log and return 500 error
- Missing fields: Return appropriate error messages

---

## Testing Checklist

- [ ] User can upload payment screenshot
- [ ] Screenshot is compressed if > 2MB
- [ ] Screenshot sent successfully (Send Screenshot button enabled)
- [ ] Polling starts after screenshot sent
- [ ] Polling messages display correctly
- [ ] Admin can view screenshot in modal
- [ ] Admin can confirm booking
- [ ] User receives alert when admin confirms
- [ ] User auto-navigates to home after confirmation
- [ ] Polling clears when user clicks "Back to Home"
- [ ] No memory leaks (polling stops on unmount)
- [ ] Browser console shows polling logs

---

## Configuration

**Polling Interval:** 3 seconds (configurable in `startPolling()`)
**Image Compression:** 
- Initial quality: 80%
- Final fallback quality: 30%
- Size threshold for compression: 2MB

**API Base URL:** `http://127.0.0.1:5001/api` (configured in Payments.jsx)

---

## Browser Compatibility

- Modern browsers with:
  - Fetch API
  - FileReader API
  - Canvas API (for image compression)
  - React Hooks (useRef, useEffect)

---

## Security Notes

- Base64 images stored in MongoDB (consider file size limits in production)
- No user authentication currently implemented
- CORS configured to allow all origins (update for production)
- Images not validated (consider adding image format validation)

---

## Future Improvements

1. Add configurable polling interval
2. Add max polling duration (e.g., 5 minutes) with timeout
3. Add WebSocket support for real-time updates instead of polling
4. Add user notification system (toast notifications)
5. Add request timeout and retry logic
6. Add image validation (format, content verification)
7. Add user authentication and authorization
8. Implement proper image storage (S3, Cloudinary, etc.)
9. Add payment status history/timeline
10. Add automated refund mechanism if admin rejects payment
