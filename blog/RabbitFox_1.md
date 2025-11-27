#Understanding the Lotka–Volterra Equations
The Lotka–Volterra equestions were first proposed in the 1920s. They have been studied by many and several explanatory articles are available online. I find the model itself
quite interesting and now find myself writing my version of explaining these equations. I will be writing this over a series of posts of which this is the first. This article
introduces the equations and explains most the maths needed to understand the problem. Over the following posts I will then focus on additional complications which create
insights into the power of the equations inspite of their relat9ive simplicity. 

It is important that we understand what the equatiosn are, what they assume and, therefore, what they are not. I have considered this using the prism of the predator prey
charateristics and have adopted the convention of using foxes and rabbits. In this my rabbits are considerably less resourceful than Peter and my foxes are more competent
than Mr Todd.
 
##Predator-Prey Model
The Lotka–Volterra equations are a pair of first-order nonlinear differential equations. They are frequently used to describe the dynamics of biological systems 
in which two species interact, one as a predator and the other as prey. The populations change through time according to the pair of equations. 
$$\frac{dx}{dt}=\alpha x - \beta xy$$
$$\frac{dy}{dt}=\gamma y - \delta xy$$
where the variable x is the population density of rabbits and the variable y is the population density of foxes. The variable t represents time.

The prey's parameters, $\alpha$ and $\beta$ respectively describe the maximum prey per capita growth rate, and the effect of the presence of predators on the prey death rate.
The predator's parameters, $\gamma$ and $\delta$ respectively describe the predator's per capita death rate, and the effect of the presence of prey on the predator's growth rate.
All parameters are positive and real.
The solution of the differential equations is deterministic and continuous. This, in turn, implies that the generations of both the predator and prey are continually 
overlapping.

The model relies on some fundamental assumptions.
1. The prey population finds ample food at all times.
2. The food supply of the predator population depends entirely on the size of the prey population.
3. The rate of change of either population is proportional to its size.
4. During the process, the environment does not change in favour of one species, and genetic adaptation is inconsequential.
5. Predators have limitless appetite.
6. Both populations can be described by a single variable. This assumes that the populations do not have a spatial or age distribution that changes the population relationships.

In any real system the above is clearly overly limiting and thus the equations do have an element of the 'spherical chicken in a vacuum' approach. Despite this though the
Lotka–Volterra model is still able to provide insights. Firstly, the dynamics of predator and prey populations have a tendency to oscillate. Fluctuating numbers of predators 
and prey have been observed in natural populations. Secondly, the population equilibrium of this model has the property that the prey equilibrium density depends on the 
predator's parameters, and the predator equilibrium density on the prey's parameters. This has as a consequence that an increase in, for instance, the prey growth rate, 
leads to an increase in the predator equilibrium density, but not the prey equilibrium density. Making the environment better for the prey benefits the predator, not the prey. 

The population equilibrium is where the population rate of change is equal to zero. By inspection this can occur either when that population is zero or when the other population
is equal to a predefined value. 

This blog series is supported by a relatively simple python script that the author developed. The script uses scipy to numerically integrate the ODE. The data is then plotted 
to allow the reader too see the relationship between the predator and prey populations. A typical chart is shown below and this will be used in all future investigations. 
This article therefore concludes by explaining how to interpret the data presented. 
<img src="images/rabFox1.png" alt="Typical Chart" width="400"/>
The chart on the left shows the variation of populations with time. The chart on the right shows this data as a phase plot so that the time of the point is unknown.
The left chart is more intuitive to understand but the chart on the right is perhaps more useful in understanding the relationship. However, this is best seen when
a variable is changed. In this demonstration the variable being changed is the initial number of prey animals in the meadow. No other parameters are changed and this 
results in the chart below.
<img src="images/rabFox2.png" alt="Typical Chart" width="400"/>
The general shape in all cases is the same. However, the size of the variation is not linear with the starting condition, the biggest variation is for 10 initial prey but 
the smallest is for 30.

The reasons behind this are quite interesting and will be the subject of the follow up articles.