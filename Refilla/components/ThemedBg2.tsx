// components/ThemedView

import { View, type ViewProps } from 'react-native';
import { useColors } from '../src/theme/colors'

type Props = ViewProps;

const ThemedViewBg = ({ style, ...props }: Props) => {
  const c = useColors();

  return (

    <View style={[{backgroundColor: c.bg2}, style]} {...props} />

  )
}

export default ThemedViewBg