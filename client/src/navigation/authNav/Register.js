// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';


import UserGoals from "../../screens/auth/register/UserGoals.js";
import UserInformation from "../../screens/auth/register/UserInformation.js";
import UserAccountInformation from "../../screens/auth/register/UserAccountInformation.js";


const RegisterStack = createMaterialTopTabNavigator();
const Register = () => {
    return (
        <RegisterStack.Navigator
            initialRouteName="UserGoals"
            screenOptions={{
                headerShown: false,
                // tabBarLabelStyle: { fontSize: 12 },
                // tabBarItemStyle: { width: 100 },
                // tabBarLabel: ["label", "laskj"],
                tabBarStyle: { marginTop: 20 },
            }}
        >
            <RegisterStack.Screen
                options={{ tabBarLabel: "goals", }}
                label="goals" name="UserGoals" component={UserGoals} />
            <RegisterStack.Screen
                options={{ tabBarLabel: "information", }}
                name="UserInformation" component={UserInformation} />
            <RegisterStack.Screen
                options={{ tabBarLabel: "signup", }}
                name="UserAccountInformation" component={UserAccountInformation} />
        </RegisterStack.Navigator>
    );
};
export default Register;
// import UserGoals from "../../screens/auth/register/UserGoals.js";
// import UserInformation from "../../screens/auth/register/UserInformation.js";
// import UserAccountInformation from "../../screens/auth/register/UserAccountInformation.js";


// const RegisterStack = createNativeStackNavigator();
// const Register = () => {
//     return (
//         <RegisterStack.Navigator
//             screenOptions={{
//                 headerShown: false,
//             }}
//         >
//             <RegisterStack.Screen name="UserGoals" component={UserGoals} />
//             <RegisterStack.Screen name="UserInformation" component={UserInformation} />
//             <RegisterStack.Screen name="UserAccountInformation" component={UserAccountInformation} />
//         </RegisterStack.Navigator>
//     );
// };
// export default Register;