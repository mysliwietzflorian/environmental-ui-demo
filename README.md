# environmental-ui-demo

> An environmental user interface takes information from a device’s surroundings and uses it to render physically-accurate things on the screen. It appears as if the lights around you are shining on the things on the screen. If the lighting in your room is bright, then the things on your screen are brightly lit. They can even take on complex characteristics like mother-of-pearl or opal.
>
> *(Extract from [Bob Burrough - The Environmental User Interface](https://bobburrough.com/public/post/environmentally_lit_interface_a_quantum_leap_forward/))*

&nbsp;

<p align="center">
    <img alt="demonstration overview" src="doc/img/overview-01.png">
</p>

## Caution :warning:

Usage of this demo on mobile devices for an extended period can harm it permanently. Lower the "Timer update rate" on the slider only to an appropriate amount and use with caution.

DO NOT leave the device running in this mode for a long time.

## Implementation details :book:

To find out more about the implementation details take a look at the documentation [here](./doc/implementation.md).

## Quick start :snail:

Use the following instructions:

- Clone the git repository - `git clone https://github.com/mysliwietzflorian/environmental-ui-demo.git`.
- Navigate to server directory - `cd environmental-ui-demo/server`.
- Install dependencies - `npm install`.
- Start the server - `npm start`.
- Browse to `https://localhost` to view the static website. (Use HTTPS)
    - **Alternatively**: Use external IP address listed in server CLI to connect from a different device (other PC or mobile device) in the same network (e.g. `192.168.1.10`).

Currently, this demonstration only works in certain browsers.

## Dependencies :children_crossing:

### Server
- express (^4.17.1)
- os (^0.1.1)

### Client
- jQuery (3.4.1)
- bootstrap grid (4.3.1)
- fonts.googleapis: `Source Sans Pro`

## Further Reading :books:

The original concept comes from Bob Burrough and his blogposts and videos:
- [The Environmental User Interface: A Quantum Leap Forward](https://bobburrough.com/public/post/environmentally_lit_interface_a_quantum_leap_forward/)
- [Common Questions About Environmental User Interfaces](https://bobburrough.com/public/post/surely_you_cant_be_serious_bob/)
