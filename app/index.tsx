import { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bgImage = require('../assets/Background.png');

type Profile = {
  _id?: string;
  name: string;
  email: string;
  location: string;
  preferences: string[];
};

export default function ProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const locations = [
    'North America (Cold)',
    'North America (Warm)',
    'South America (Tropical)',
    'Europe (Temperate)',
    'Africa (Desert)',
    'Africa (Tropical)',
  ];

  const preferenceOptions = ['Modern', 'Conservative', 'Classic', 'Bold', 'Simple'];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem('profile');
        if (saved) {
          const data: Profile = JSON.parse(saved);
          setName(data.name);
          setEmail(data.email);
          setLocation(data.location);
          setPreferences(data.preferences || []);
          setProfileId(data._id || null);
          setIsEditing(true);
        }
      } catch (error) {
        console.log('Load error:', error);
      }
    };

    loadProfile();
  }, []);

  const togglePreference = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const saveProfile = async () => {
    if (!name || !email || !location || preferences.length === 0) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    const profileData: Profile = { name, email, location, preferences };

    try {
      const BASE_URL = 'http://168.122.130.102:5000'; //your ip

      const url = profileId
        ? `${BASE_URL}/api/profile/${profileId}`
        : `${BASE_URL}/api/profile`;

      const method = profileId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      await AsyncStorage.setItem('profile', JSON.stringify(data.profile));

      router.push('/homeS');
    } catch (error) {
      console.log('Fetch error:', error);

      // fallback so app doesn't crash
      await AsyncStorage.setItem('profile', JSON.stringify(profileData));
      router.push('/homeS');
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>
          {isEditing ? 'Save Profile' : 'Create Profile'}
        </Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={styles.label}>Email *</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} />

        <Text style={styles.label}>Location *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={location} onValueChange={(val) => setLocation(val)}>
            <Picker.Item label="Select location" value="" />
            {locations.map((loc) => (
              <Picker.Item key={loc} label={loc} value={loc} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Preferences *</Text>
        <View style={styles.multiContainer}>
          {preferenceOptions.map((pref) => (
            <TouchableOpacity
              key={pref}
              style={[
                styles.optionButton,
                preferences.includes(pref) && styles.selectedOption,
              ]}
              onPress={() => togglePreference(pref)}
            >
              <Text style={styles.optionText}>{pref}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={saveProfile}>
          <Text style={styles.buttonText}>
            {isEditing ? 'Update Profile' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  heading: { fontSize: 30, marginBottom: 20, textAlign: 'center', color: '#fff' },
  label: { marginTop: 10, color: '#fff' },
  input: { borderWidth: 1, padding: 10, borderRadius: 6, color: '#fff' },
  pickerContainer: { borderWidth: 1, borderRadius: 6 },
  multiContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  optionButton: { borderWidth: 1, padding: 8, margin: 4, borderRadius: 20 },
  selectedOption: { backgroundColor: '#1543db' },
  optionText: { color: '#fff' },
  button: { backgroundColor: '#1543db', padding: 15, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center' },
});
