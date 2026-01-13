# More thoughts on mapping

When initially developing the game I had thought that the engine would matter the most. I therefore just asked for a 'schematic' style map to be built with cirlces for provinces and adjacency shown via lines linking the 
circles. This was relatively simple and laid out a board quickly. Schematic layouts are common in engineering (my own field) and therefore this felt a really good way to start. Have it set up and then off to focus on the
'meat' of the problem the game engine. The schematic map is shown below.

<img src="images/Dip_Img_01.png" alt="Schematic map layout" width="600"/>

As I then started to implement the rules though I found it to be increasingly difficult to 'see' which item could move where as coast lines and land borders where only visible if you knew the game board incredibly well.
I do not! I then wondered if simply including a back ground image and removing the connection lines would improve matters. This is a little better but the layout and line up of the centres and coast lines is now in need 
of a few adjustments and a little bit of a tidy up as shown below.

<img src="images/Dip_Img_02.png" alt="Improved map layout" width="600"/> 

I therefore have decided that the next development is to get the map up to final(ish) production standard. I still want this to be via a standalone file as far as possible. This will allow the creation of new maps. I will
also use this as the project stage to implement the fleet and army movements for adjacency. I think that I shall update the underlying details so that there are army and fleet adjancy. This would then allow a future upgrade
of additional types of unit if I can find a suitable additional rule in that regard.

A final upgrade to be completed as well is to actual draw the provinces directly as this will then allow the provinces to be coloured according to rules that are then implemented in the engine.