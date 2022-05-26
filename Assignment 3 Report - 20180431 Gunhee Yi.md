# KAIST CS380 2022 Spring
# Assignment #3: Let There Be Light

##### 이건희 (Gunhee Yi)

##### 20180431

All codes were written in those four files: "modules/assignments/assignment3.js", "modules/custom_blinn_phong.js", "modules/resources/custom_blinn_phong.frag" and "modules/resources/custom_blinn_phong.frag".

## 1. Colored Illuminance
Color lights were implemented. You may notice that directional, point and spotlight each shows slightly reddish/greenish/blueish color respectively.

## 2. Point Light, and Spotlight Sources
Point light and spotlight sources were implemented. If you turn off all the illuminances other point/spotlight using the handles below, you will clearly see the characteristics of each light: being weaker when far from source(point) / only shines within certain angle (spot).

## 3. Materials
You can set reflectivity to R, G, B channel respectively to primitive shape(meshes). For the ease of implementation, only the head part's R, G, B reflectivity was set as 1, 0, 0 respectively and 1, 1, 1 for other shapes. If you turn off lights other than ambient/directional light, you would clearly see that only the face is "blushed" due to its inherent reflectivity.

## 4. Creativity
You can change the illuminance and moreover position of the light source (if its type supports it), by adjusting the handles below. You may even adjust the angle and angle-smoothness of the spotlight.
There is a fire (point light) attached to the character's right hand. Its parent is set as the hand, so it moves as you move the character's body, arm and hands. The controls to move the character is same as the previous assignment.
