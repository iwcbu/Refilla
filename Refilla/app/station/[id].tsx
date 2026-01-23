import { StyleSheet, View, Text, Image } from "react-native";
import { Station } from "../../types/station";

const station: Station = {
  id: "test",
  lat: 1,
  lng: 1,
  buildingAbre: "TST",
  buildingName: "TESTSTATION",
  buildingDetails: "Test description, describes where to go",
  filterStatus: "GREEN",
  stationStatus: "PENDING",
  bottlesSaved: 300,
  lastUpdated: "Test",
};

function filterColor(status: string) {
  if (status === "GREEN") return "#16a34a";
  if (status === "YELLOW") return "#f59e0b";
  return "#ef4444";
}

function statusColor(status: string) {
  if (status === "ACTIVE") return "#16a34a";
  if (status === "PENDING") return "#f59e0b";
  return "#ef4444";
}

function softBg(hex: string) {
  if (hex === "#16a34a") return "#dcfce7";
  if (hex === "#f59e0b") return "#fffbeb";
  return "#fee2e2";
}

export default function StationDetail() {
  const fColor = filterColor(station.filterStatus);
  const sColor = statusColor(station.stationStatus);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Station Details</Text>
        <Text style={styles.subtitle}>
          {station.buildingName} • {station.buildingAbre}
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Top row */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Station ID</Text>
            <Text style={styles.value}>#{station.id}</Text>
          </View>

          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>Bottles saved</Text>
            <Text style={styles.statPillValue}>{station.bottlesSaved}</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: softBg(fColor), borderColor: fColor }]}>
            <Text style={styles.badgeKey}>Filter</Text>
            <Text style={[styles.badgeVal, { color: fColor }]}>{station.filterStatus}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: softBg(sColor), borderColor: sColor }]}>
            <Text style={styles.badgeKey}>Status</Text>
            <Text style={[styles.badgeVal, { color: sColor }]}>{station.stationStatus}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where to go</Text>
          <Text style={styles.details}>
            <Text style={styles.detailsStrong}>{station.buildingAbre}:</Text>{" "}
            {station.buildingDetails}
          </Text>
          <Text style={styles.meta}>Last updated: {station.lastUpdated}</Text>
        </View>

        {/* Map image */}
        <View style={styles.mapWrap}>
          <Image
            source={{ uri: "https://wordpress.wbur.org/wp-content/uploads/2019/02/Allston-1000x699.png" }}
            style={styles.map}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f6f7fb",
  },

  header: {
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  label: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  statPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 120,
    alignItems: "flex-end",
  },
  statPillLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  statPillValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },

  badgeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  badge: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  badgeKey: {
    fontSize: 11,
    color: "#475569",
  },
  badgeVal: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
  },

  section: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  detailsStrong: {
    fontWeight: "800",
    color: "#0f172a",
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: "#94a3b8",
  },

  mapWrap: {
    marginTop: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  map: {
    width: "100%",
    height: 220,
    alignSelf: "center",
  },
});
