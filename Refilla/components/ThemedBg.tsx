// components/ThemedView

import { View, type ViewProps } from 'react-native';
import { useColors } from '../src/theme/colors'

type Props = ViewProps;

const ThemedBg = ({ style, ...props }: Props) => {
  const c = useColors();

  return (

    <View style={[{backgroundColor: c.bg}, style]} {...props} />

  )
}

export default ThemedBg