import React from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

const ShowMedia = ({ imageUrls }) => {
    console.log("MEDIA", imageUrls);

    const renderItem = ({ item, index }) => {
        // Check if the item is an image or video based on the URL
        const isVideo = item.includes('/videos');
        if (isVideo) {
            return (
                <View key={index}>
                    <Video
                        source={{ uri: item }}
                        style={styles.video}
                        resizeMode="cover"
                        controls={true}
                        volume={0}
                    />
                </View>
            );
        } else {
            return (
                <Image key={index} source={{ uri: item }} style={styles.image} />
            );
        }
    };
    return (
        <FlatList
            data={[...imageUrls.images, ...imageUrls.videos]}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal={true}
        />
    );
};

const styles = StyleSheet.create({
    image: {
        width: 210,
        height: 270,
        margin: 15,
        resizeMode: 'cover',
    },
    video: {
        width: 210,
        height: 270,
        margin: 15,
    },
});

export default ShowMedia;
