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

## Dark Mode

Dark Mode shall be utilized automatically if the space around the user is not well lit. This does not mean that the UI-elements are just dark and one would need an external light to read and understand the UI, but rather the eyes should not be exposed to a lot of bright light from the display. To be able to see the elements in a natural way specific parts of the UI (like the font) can be made self-luminous to be legible.

This behavior can be compared to a skyline of a town:
- As the sunlight shines all buildings can be seen perfectly.
- At dusk the light will be less and less intense while structures are still well defined.
- At nightfall street lanterns and the lights in the windows will be visible and as a result the skyline is still perceptible. The view changes in a way that the end-user can predict.

That is why Dark Mode is triggered when all regions of the current frame fall below a defined threshold. That value can be manipulated with the slider "**Dark-Mode trigger value**". To have a stable color theme on environments with small or frequent changes of light the value to trigger Light Mode again should be set higher than the other threshold and can be adjusted with the slider "**Light-Mode trigger value**". If the values of either slider is set to the corresponding extreme, a color theme can be established permanently without changing other logic.

### Soft and hard shadows

As described in the Wikipedia article about [hard and soft light](https://en.wikipedia.org/wiki/Hard_and_soft_light) the following aspects about shading can be said:

> The hardness or softness of light depends mostly on the following two factors:
- Distance. The closer the light source, the softer it becomes.  
- Size of light source. The larger the source, the softer it becomes.  
>
>*(Extract from [Wikipedia - Hard and soft light](https://en.wikipedia.org/wiki/Hard_and_soft_light))*

From the input data alone the application cannot directly find information about the distance of the light source, so this part is not applied here.
However, we can take a guess at the size of a light source by counting regions which are reasonable well lit, e.g. have a high enough grayscale value. This threshold is defined by a fixed percentage of the maximum brightness. The more sources are found, the softer the shadows should be and, consequently, the lower the alpha value must be. This proportion is not implemented linearly but leans to the softer shadows for visual appearance reasons.

The usage of variable shadow softness can be user-toggled with the checkbox "**Adjust alpha value of shadows**". If disabled, the alpha value of the shadow will be constant. On the other hand, if that feature is enabled the number of light sources based on the average regions (1 to 9 light sources are possible) will be extracted. A region will be recognized as a light source if the value of that region is at least `lightSourceFactor`% of the region with the maximum brightness. That variable can be adjusted with the slider "**Light source factor**".

