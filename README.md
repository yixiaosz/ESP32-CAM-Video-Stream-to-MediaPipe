# ESP32-CAM Video Stream to MediaPipe Hand Tracking via OBS

Run MediaPipe hand tracking in a web app using your ESP32-CAM video source. This project uses OBS Studio's Virtual Camera as a simple bridge, converting the ESP32's MJPEG stream (which MediaPipe can't use directly) into a compatible webcam feed, eliminating the need for manual transcoding tools such as FFmpeg. 

## Prerequisites

*   An ESP32-CAM mounted on an ESP32-CAM-MB
*   A stable Wi-Fi network
*   OBS Studio
*   A modern web browser (Chrome, Safari, Firefox, Edge etc.)

## Instructions

1.  **Get ESP32-CAM Stream Address:**
    *   Connect your ESP32-CAM to your Arduino IDE.
    *   Set board library to `"AI Thinker ESP32-CAM"` and choose the correct serial port.
    *   Open `cameraWebServer.ino` and enter your Wi-Fi credentials.
    *   Verify and upload cameraWebServer.ino. 
    *   Open serial monitor and wait for it to connect to your Wi-Fi network. <br/>
        <img src="instructions/image_1.png" width="60%" alt="">
    *   Note the IP address assigned to the ESP32-CAM. This is the base URL for the video stream.

2.  **Configure Stream Source in OBS:**
    *   Open OBS Studio.
    *   In the 'Sources' panel, click the '+' button to add a new source. Select "Browser" from the list. <br/>
        <img src="instructions/image_2.png" width="60%" alt="">
    *   In the properties window for the Browser source:
        *   Paste the ESP32-CAM's IP address into the **URL** field.
        *   Append `/stream` to the URL. Example: `http://192.168.1.78/stream`
        *   Set the **Width** and **Height** (e.g., 320x240, or match your ESP32 stream resolution).
        *   Click "OK". <br/>
        <img src="instructions/image_3.png" width="60%" alt="">
    *   You should now see the ESP32-CAM video feed in your OBS scene. You might need to click the "Refresh" button in the Browser source properties if it doesn't appear immediately.
    *   In the 'Controls' panel, click "Start Virtual Camera".<br/>
        <img src="instructions/image_4.png" width="60%" alt="">

3.  **Find OBS Virtual Camera ID:**
    *   Run  `index.html` in your local server.
    *   You will receive some error messesages because it can't fetch the correct video source. 
    *   Open the browser's Developer Console and look for the output listing available camera devices. 
    *   Identify the entry labeled "OBS Virtual Camera" (or similar).
    *   Copy the long string `Camera ID` associated with the OBS Virtual Camera.<br/>
    <img src="instructions/image_5.png" width="60%" alt="">

6.  **Reconfigure `index.html` File:**
    *   Open `index.html` again. 
    *   Locate `CAMERA_ID` constant at line 108 and replace the placeholder with the OBS Virtual Camera ID you copied. 
    *   Ensure `VIDEO_WIDTH` and `VIDEO_HEIGHT` constants match the resolution you set in OBS. 
    *   Save the HTML file.
    <img src="instructions/image_6.png" width="60%" alt="">

7.  **Run the Hand Tracking Application:**
    *   Refresh the MediaPipe hand tracking HTML page in your browser.
    *   If prompted, grant the browser permission to access the camera. 
    *   You should now see the video feed from your ESP32-CAM in the top right corner of the web page, and MediaPipe should be processing it for hand landmarks and gestures.<br/>
    <img src="instructions/image_7.png" width="60%" alt="">
