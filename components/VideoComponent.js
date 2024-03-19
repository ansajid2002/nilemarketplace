import { View, Text, Dimensions, StyleSheet } from 'react-native'
import React from 'react'
import { ResizeMode, Video } from 'expo-av';

const VideoComponent = ({vid}) => {
    console.log(vid,"Viiddd");
    const [status, setStatus] = React.useState({});
const video = React.useRef(null);
width = Dimensions.get('window').width;
  return (
    <View style={[styles.container, { width }]} className="flex-1 "  >
                  
                <Video
                  ref={video}
                  className="flex-1  w-full"
                  source={{
                    uri: vid,
                  }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping={true}
                  onPlaybackStatusUpdate={status => setStatus(() => status)}
                />
                </View>
  )
}

export default VideoComponent

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 12,
    },
})