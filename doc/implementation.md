# environmental-ui-demo (implementation details)

## Camera/Webcam

This application makes use of the user camera or webcam with [`Navigator.mediaDevices`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/mediaDevices). All modern browsers require user interaction to allow access to these devices.

> First, getUserMedia() must always get user permission before opening any media gathering input such as a webcam or microphone.  
>
> *(Extract from [MDN - MediaDevices.getUserMedia()#User_privacy](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#User_privacy))*

Moreover, the files are served via HTTPS and a self-signed certificate to ensure a secure context for the media devices. Otherwise, (especially on mobile platforms) the camera cannot be accessed correctly. The provided certificate files MUST NOT be used in a production environment.

> The getUserMedia() method is only available in secure contexts. A secure context is one the browser is reasonably confident contains a document which was loaded securely, using HTTPS/TLS, and has limited exposure to insecure contexts. If a document isn't loaded in a secure context, the navigator.mediaDevices property is undefined, making access to getUserMedia() impossible.  
>
> *(Extract from [MDN - MediaDevices.getUserMedia()#Encryption_based_security](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Encryption_based_security))*

