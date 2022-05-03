# KAIST CS380 2022 Spring
# Assignment #2: An Avatar of Lost Arcball

##### 이건희 (Gunhee Yi)

##### 20180431


## 1. 3D Geometric Objects
generateCone() and generateCylinder() functions were implemented. The avatar described in following sections were constructed with these functions, plus generateCube() and generateEllipsoid()( -> it was made by slightly modifying the generateSphere() function).

## 2. Hierarchical Modeling of Avatar
My avatar has 27 primitive parts in total, which are:
head, hair, eye*2, upper body, body, lower body, arm(upper arm, elbow, lower arm, hand)*2, leg(upper leg, knee, lower leg, boots neck, boots)*2
Each parts were attached to a reasonable parent part, except the body and the right upper leg. The body was the root and the right upper leg would not move for our posing. Please refer to the codes directly to see which primitives were those parts constructed with, and to which were they attached to. Hierarchical transformation was already implemented in previous lab, so each parts would transform according to their parents.

## 3. Interactive Avatar Pose
Here are some keyboard keys to make my avatar move (more specifically, rotate each parts):
f/g: right upper leg
h/j: right lower leg
k/l: left upper leg (which is actually stationary at the ground, the body moves)
t/y: right upper arm
u/i: right lower arm
o/p: left upper arm
\[/\]: left lower arm

You can pose the avatar freely with these keys, but there is a specific pose of this avatar called the "cutie" pose. You can adjust each parts (left/right upper/lower arm, body, right leg) by clicking onto them. You should click all those six parts to complete the cutie pose.

You can also adjust the camera orientation with keyboard inputs. Use arrow + shift + space keys for its position, and w/a/s/d/q/r keys for its looking direction.

Please note that all the keyboard inputs will work properly only when the keybaord set is set to English.

## 4. Creativity
I tried to make my avatar resemble IU in [Jay Park's '가나다라' music video](https://youtu.be/gFb1TftvdoM?t=265)(Looks similar? Not at all to me either haha...). I made up a dress and a pair of boots with the same color. And most importantly, I defined a generateHair() function so that I could generate the "hair" shape in whatever length I desire.
