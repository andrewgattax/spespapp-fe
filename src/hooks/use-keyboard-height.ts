import {useSharedValue} from "react-native-reanimated";
import {useKeyboardHandler} from "react-native-keyboard-controller";

const OFFSET = 0;

export function useKeyboardHeight() {

  const totalOffset = OFFSET;

  const height = useSharedValue(totalOffset);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        height.value =
          e.height > 0 ? Math.max(e.height + OFFSET, totalOffset) : totalOffset
      }
    }
  )

  return height;

}
