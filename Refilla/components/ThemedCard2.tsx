// components/ThemedView

import { View, type ViewProps } from 'react-native';
import { useColors } from '../src/theme/colors'

type Props = ViewProps;

const ThemedCard2 = ({ style, ...props }: Props) => {
  const c = useColors();

  return (

    <View style={[{backgroundColor: c.card2, borderColor: c.border2}, style]} {...props} />

  )
}

export default ThemedCard2