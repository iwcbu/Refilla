// components/ThemedView

import { Text, type TextProps } from 'react-native';
import { useColors } from '../src/theme/colors'

type Props = TextProps;

const ThemedSubtext = ({ style, ...props }: Props) => {
  const c = useColors();

  return (

    <Text style={[{color: c.subtext}, style]} {...props} />

  )
}

export default ThemedSubtext