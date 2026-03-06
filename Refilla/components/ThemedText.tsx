// components/ThemedView

import { Text, type TextProps } from 'react-native';
import { useColors } from '../src/theme/colors'

type Props = TextProps;

const ThemedText = ({ style, ...props }: Props) => {
  const c = useColors();

  return (

    <Text style={[{color: c.text}, style]} {...props} />

  )
}

export default ThemedText