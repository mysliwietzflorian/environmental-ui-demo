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

## Preprocessing

As soon as the user grants permissions to use the camera device, a stream is captured in a HTMLVideoElement. Furthermore, a canvas element draws periodically an image from the video and applies the following preprocessing to it:

- Mirror the input image
- Transform to grayscale colors
- Calculate region averages for 9 regions (3x3 matrix)
- Calculate middle brightness gradient for these regions

## Update loop

A user can define the update rate of the shadows with the slider "**Timer update rate**". Every interval of this value an image from the video stream is captured and the update procedure is executed. With the button "Stop updates" the user can toggle the execution of said updates.

The update loop is powered by the [`setInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) and [`clearInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/clearInterval) methods of the `WindowOrWorkerGlobalScope`.

Noteworthy is, that the actual redrawing of the shadow only happens if the pixel offsets of the shadows change in comparison to the frames before and the application is not in Dark Mode.

## Shadow properties

The shadow created for UI-elements can be defined with a few simple variables. While we have already covered shadow offsets from the gradients (more or less the direction of the shadows) the effective distances in pixels still leave some explanation open.

Here two variables come into play:
- `maxShadowDistance` defines the maximum amount of pixels the shadow can be away from the inner UI-element.
- `maxExtension` is a quantity for the number calculated in the gradient value that complies with the maximum distance for the result. All gradients bigger than `maxExtension` will have a distance of `maxShadowDistance` pixels from the UI-elements.

Therefore, the initial gradient offsets will be normalized using the following process:

- Convert the gradient offset coordinates (x and y) to polar coordinates (distance, angle).
- Limit the gradient distance to `maxExtension`.
- Linear interpolate the gradient distance to a value between 0 and `maxShadowDistance`. The result is the distance for the pixel offsets from the UI-elements.
- Convert the pixel distance and the gradient angle back to the resulting cartesian pixel offsets.
- Lastly, the offsets will be rounded to the nearest integer.

The slider "**Maximum shadow distance**" adjusts the shadow's coordinates for all UI-elements.
