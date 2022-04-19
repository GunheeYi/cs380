# KAIST CS380 2022 Spring
Assignment #1: Animated 2D Scene

이건희 (Gunhee Yi)

20180431

## 1. Background
To give a feel of the sun setting, the background is a gradient of three colors: navy, gray and orange, from top to bottom. For a gradient of two colors, one might have needed two triangles that form a background rectangle and have them shaded with the given vertex color shader. Instead, I used four triangles, where each of two form the upper/lower rectangles. So basically, the background is a set of two rectangle color gradients that each has two triangles in it.

There is also a rough solid black polygon at the bottom to represent the ground.

## 2. Fractal-like object from nature & their animations
- Ferns

The scene has two types of fractal-like natural objects: the fern and the tree. The fern has leaves that are fat at the bottom and get slimmer along to the end. The sub-stems and the ferns themselves show a similar form as the leaves, which is a characteristic of a fractal.

The vertices that are used to build a fern is produced by the fernVertices() function, and you can adjust the level of the recursive fractal by the "level" parameter.

To give some variance and vibrance to the scene, the size, color and position of every ferns are determined randomly within a certain range.

Period and phase of the swaying motion of the ferns are also determined randomly. The motion is illustrated by a framerate-independent animation where the absolute position is determined by the time elapsed.

- Trees

Trees also show a fractal pattern, in that a branch and the sub-branch attached to it looks like a single tree as a whole. The recursive level can be adjusted, and the attributes(appearance & motion) are determined randomly just as the ferns. Even though the direction of a branch is random, it is slightly restricted to have enough space with other sibling branches, to make the tree appear more realistic.

## 3. Challenge: Keyframe-based animation
The deer in the scene is animated based on keyframes. The deer is divided into several parts, such as the body, face, ears, fore/hindlegs, and each of them has a few keyframe associated with it. Each keyframe has a timestamp. The update() function loops through those keyframes, and finds out between which of the frames current time is located in. Then it interpolates the position, rotation angle and the scale of the object and uses them to finally render it. All of the parts here has three frames each(start, middle, end), but the system itself can be expanded to any number of keyframes.

## 4. Creativity
I put a lot of effort to give this artistic aspects. The background first of all had a three-color gradient that illustrates a realistic sunset. And the appearance and motion of plants were diverse, just like they were in the real world. To make such a complex shape of the deer to be possible, the deer was  first modeled through Illustrator and its vertice data were transformed/exported into the project code.