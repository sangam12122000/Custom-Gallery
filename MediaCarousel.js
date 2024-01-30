import React, { useState, useRef } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StyleSheet,
    Platform
} from 'react-native';
import Video from 'react-native-video';
const MediaCarousel = ({ media }) => {

    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef(null);
    const [isPaused, setIsPaused] = useState(true);
    const handleTogglePlayPause = () => {
        setIsPaused(!isPaused);
    };
    const renderMediaItems = () => {
        return media.map((item, index) => (
            <View key={index.toString()} style={styles.carouselItem}>
                {item.endsWith('.jpg') || item.endsWith('.jpeg') || item.endsWith('/001') ? (
                    <Image source={{ uri: item }} style={Platform.OS === 'ios' ? styles.carouselImageIos : styles.carouselImage} />
                ) : (<>
                    <Video
                        source={{ uri: item }}
                        style={Platform.OS === 'ios' ? styles.carouselVideoIos : styles.carouselVideo}
                        controls={false}
                        resizeMode="cover"
                        paused={isPaused}
                    />
                    <TouchableOpacity
                        style={styles.playPauseButton}
                        onPress={handleTogglePlayPause}
                    >
                        {isPaused ? (
                            <Image
                                source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/play-buttton.png')}
                                style={styles.playPauseIcon}
                            />
                        ) : (
                            <Image
                                source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/pause.png')}
                                style={styles.playPauseIcon}
                            />
                        )}
                    </TouchableOpacity>
                </>

                )}

            </View>
        ));
    };
    const onScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const index = Math.floor(
            (contentOffset.x / event.nativeEvent.contentSize.width) * media.length
        );
        console.log('Content Offset X:', contentOffset.x);
        console.log('Calculated Index:', index);
        setActiveIndex(index);
    };

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            {media.map((_, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.paginationDot,
                        activeIndex === index ? styles.activeDot : styles.inactiveDot,
                    ]}
                    onPress={() => {
                        scrollViewRef.current?.scrollTo({
                            x: index * Dimensions.get('window').width,
                            animated: true,
                        });
                        setActiveIndex(index); // Update the active index when a dot is pressed
                    }}
                />
            ))}
        </View>
    );



    return (
        <View>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                {renderMediaItems()}
            </ScrollView>
            {renderPagination()}
        </View>
    );
};

const styles = StyleSheet.create({
    carouselItem: {
        height: '100%',
        width: 250,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 5,
        position: 'relative',

    },
    carouselImage: {
        height: '100%',
        width: 200,
        borderRadius: 8,
    },
    carouselImageIos: {
        height: '100%',
        width: 240,
        borderRadius: 8,
    },
    carouselVideo: {
        height: '100%',
        width: 200,
        borderRadius: 8,
    },
    carouselVideoIos: {
        height: '100%',
        width: 200,
        borderRadius: 8,
    },
    playPauseButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playPauseIcon: {
        width: '80%',
        height: '80%',
        opacity: 0.7,
        tintColor: 'black'
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 8,
        alignSelf: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 12,
        marginHorizontal: 8,
        backgroundColor: '#3498db',
    },
    activeDot: {
        height: 10,
        width: 10,
        backgroundColor: '#3498db',
    },
    inactiveDot: {
        backgroundColor: '#3d424a',
    },
});

export default MediaCarousel;
