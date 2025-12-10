import "./global.css";
import {Pressable, Text, View} from 'react-native';


export default function App() {
    console.log("App rendered ✅");

    return (
        <View className="flex-1 items-center justify-center">
            <Pressable className="bg-white rounded-xl p-4 mb-3">
                <Text className="text-black font-semibold text-lg">
                    Article title
                </Text>
                <Text className="text-neutral-500 text-sm mt-1">
                    21.10., 10:46
                </Text>
            </Pressable>
        </View>
    );
}
