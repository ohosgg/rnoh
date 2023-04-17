import { View, StyleSheet, Text } from "react-native";

export function SimpleTable(props: { title: string, data: { [key: string]: any; }; }) {
  return (
    <View style={styles.table}>
      <Text style={{ fontWeight: "bold", padding: 8, width: "100%", height: 32 }}>{props.title}</Text>
      {Object.entries(props.data).map(([key, value], idx) => {
        let valueStr = value;
        if (typeof valueStr === "object") {
          valueStr = JSON.stringify(value);
        }
        if (typeof valueStr === "boolean") {
          valueStr = value ? "true" : "false";
        }
        return (
          <View key={key} style={[styles.tableRow, { backgroundColor: idx % 2 ? "#EEE" : "transparent" }]}>
            <Text style={{ width: 200, height: "100%", }}>{key}</Text>
            <Text style={{ flex: 1, height: "100%" }}>{valueStr}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: "white"
  },
  tableRow: {
    height: 32,
    padding: 8,
    display: "flex",
    flexDirection: "row"
  }
});