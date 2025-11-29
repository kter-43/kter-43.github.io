# The Power of Equilibrium

The concept of population equilibrium was mentioned all too briefly in the first blog article I wrote about the Lotka–Volterra equations. This article explores this in more detail.

## What is equilibrium
The equilibrium population of predator and prey is the number which will exactly support the other. The equilibrium population of rabbits is equal to the fox death rate divided by the fox reproduction rate.
The equilibrium population of foxes is equal to the growth rate of rabbits divided by the predation rate of rabbits. In the example used in my first post I never stated the coefficients used. The equilibrium
points though can be relatively easily identified. Repeating the second figure below helps identify the value.

<img src="images/rabFox2.png" alt="Typical Chart" width="400"/>

By inspection the prey population central value of all loops is approximately 30, whilst the predator population appear to be approximately 5. These are essentially the cooridnates of the central point of the loops. In 
fact the coefficients used were as noted in the table below.

| Label | Value |
|:-----:|:-----:|
| $ \alpha $ | 0.1 |
| $ \beta $ | 0.02 |
| $ \gamma $ | 0.3 |
| $ \delta $ | 0.01 |

$$ E_{Rabbits} = \gamma / \delta = 0.3 / 0.01 = 30 $$
$$ E_{foxes} = \alpha / \beta = 0.1 / 0.02 = 5 $$

Therefore, our simple by inspection process actually rturned the correct outcome. The equilibrium point can be considered the centroid of the phase plot and this is typically easiest to see in that style of plot
when there are multiple loops being plotted. This is easiest to see in the plot below. This plot offsets the predator and prey initial populatiuons from the equilibrium value by a stated constant.

<img src="images/rabFox4.png" alt="Typical Chart" width="400"/>

The further away from the equilibrium the initial set up is the wider the loop becomes. This is the fundamental relationship that is defined by the equations which act as an attractor back to the equilibrium point.
The prey and predator forces though are always out of balance leading to the dynamic changes in the relationship. Exploring this  little further we can consider the impact of the excess of either predator or prey.

<img src="images/rabFox3.png" alt="Typical Chart" width="400"/> <img src="images/rabFox5.png" alt="Typical Chart" width="400"/>

The two plots are similar in that the further away the offset is by either part of the relationship (fox or rabbit) the wider the looping becomes. 