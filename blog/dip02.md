# Maps and the Development of the Mapping Functions
One of the key ways in which this game is being developed is to maintain the mapping data seperately from the rest of the game logic. This should mean that updating or changing the map in the future
is a simple operation. The map defines powers, provinces, adjacency, and starting positions.

There are seven powers in the classic version. These are
- Austria
- England
- France
- Germany
- Italy
- Russia
- Turkey

The const POWERS defines the name and id for each power, the colour it will be represented on the board and the home provinces that will be linked to that power.

There are 82 provinces (or distinct coast lines) in the classic version. These can be either land or sea. Within the land category the provinve may also be coastal allowing both fleets and armies to occupy them. Finally
a province can also be a supply centre. Each province must also have a name and id, and x and y location to be drawn on the board and have adjacency to other provinces defined. This is particularly important for some
provinces with specila rules. For example Bulgaria which has two coastlines which prevents a fleet from moving from one to the other. 

The starting positions are defined by the province and type of unit that will be present. The classic game fas fleets or armies which are defined as the 'kind' of unit in my implementation of the game. 

This appears to imply that the mapping is planning and done. However, there are some functions that are not yet solved and I may need to add constraints in some manner to implemnt them. As an exapmle consider the Liverpool 
and Yorkshire provinces. These are adjacent and armies can pass between them. They are both coastal so fleets can dock at both. However, a fleet may not move from one to the other. In fact it would take several moves to take
a fleet from one side to the other. Similar issues occur in Spain, Bulgaria and St Petersburg. All have two coastlines which prevent fleets from acting in the same manner and with the same links as armies. An army lands in
the main province but a fleet as a specific coast. For the time being this complication will remain in the 'to think' about pile. 
