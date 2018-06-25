![logo](readmeImages/critter_safari_logo.png 'logo')

##### Engaging girls in computational thinking through tangible block programming and virtual gameplay	

University of Washington MHCID 2014 Capstone project - STEM Team




## Design Overview
The design question we responded to was, **How can we engage six to eight year old girls in computational thinking through gameplay?** We focused on computational thinking because it is the foundation of computer science. It is the thought processes that entails formulating a problem into sequences of steps so that it can be effectively carried out by a computer. 

Critter Safari is an animated game world that girls can define and explore using a tangible programming interface, through which they can learn and practice the basis of computational thinking. 

This is how to play this game:

* **Pick characters and settings**: 
First, girls choose their character, setting, and critters to put in their game world. As soon as these physical figures are placed in the iPad dock they come to life on screen.

* **Planning sequence**: 
Second, they will be planning their sequence by put together direction and action blocks on the game board. They can explore the world and perform various actions, such as dance, dress up, and magic.

* **Running sequence**: 
Finally, when girls are ready to run their sequence, they hit the run button  and enjoy the animation on the screen! 

The whole design process is documented here in our [Process Blog](http://cseforgirls.wordpress.com/). To know more about our design concept, click the image below to watch our concept video :arrow_down:
[![game overview](readmeImages/game_overview.png 'game')](https://www.youtube.com/watch?v=U2NWeVoK--Y)


## Implementation

The functional prototype is divided into three parts:

*  The iPad game
*  The tangible programming interface(including Blocks and Boards)
*  The server application that read and host the data 

This repository include all the code for the iPad game and the web server(under the ```CritterSafariServer``` folder). We used [Cocos2d-JS](http://www.cocos2d-x.org/wiki/Cocos2d-JS) game engine to create the iPad game. The server side is implemented using NodeJS.

The tangible interface is implemented with two Arduino UNO boards, one for the settings board and one for the programming board. The way we identify different blocks is through giving each type of blocks a different resistor, and using the analog reading on arduino to differentiate them. The related code can be found [here](https://github.com/tarhata/CritterSafariBoard_arduino).


![prototype](readmeImages/functional_prototype.png 'prototype')

A video demo for this functioanl prototype is working in process, we will update soon!
