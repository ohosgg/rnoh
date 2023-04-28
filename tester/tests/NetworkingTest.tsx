import { StyleSheet, Text, View } from "react-native";
import { TestCase, TestSuite } from "../components";
import React from "react";

const MovieList = () => {

    type Movie = {
        id: string;
        title: string;
        releaseYear: string;
    };

    const [isLoading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<Movie[]>([]);

    React.useEffect(() => {
        getMovies();
    }, []);

    return (
        isLoading ? <Text style={styles.loadingText}>Loading...</Text> : <View>
            {data.map((movie) => (
                <Text style={styles.movieDetails}>
                    {movie.title}, {movie.releaseYear}
                </Text>
            ))}
        </View>
    )
}

export const NetworkingTestSuite = () => {
    const canFetch = async (url: string) => {
        try {
            const response = await fetch(url);
            const _result = await response.json();
            return true
        } catch (error) {
            return false
        }
    };

    return (<TestSuite name="Networking">
        <TestCase itShould="download data" fn={async ({ expect }) => {
            const received = await canFetch('https://reactnative.dev/movies.json')
            expect(received).to.be.true
        }} />
        <TestCase itShould="fail on bad url" fn={async ({ expect }) => {
            const received = await canFetch('https://reactnative.dev/bad_url.json')
            expect(received).to.be.false
        }} />
    </TestSuite>)
};

const styles = StyleSheet.create({
    movieDetails: {
        height: 20,
        width: '100%',
    },
    loadingText: {
        fontSize: 20,
        height: 40,
        width: '100%',
    }
});