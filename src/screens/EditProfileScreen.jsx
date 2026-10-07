import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { apiRequest } from '../services/api';

export default function EditProfileScreen({
  navigation,
  route,
}) {
  const currentUser = route.params?.user;

  const [name, setName] = useState(
    currentUser?.name || ''
  );

  const [usn, setUsn] = useState(
    currentUser?.usn || ''
  );

  const [phone, setPhone] = useState(
    currentUser?.phone || ''
  );

  const [department, setDepartment] = useState(
    currentUser?.department || ''
  );

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedUsn = usn.trim().toUpperCase();

    if (!trimmedName) {
      Alert.alert(
        'Missing Name',
        'Please enter your full name.'
      );
      return;
    }

    if (!trimmedUsn) {
      Alert.alert(
        'Missing USN',
        'Please enter your USN.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest(
        '/users/profile',
        {
          method: 'POST',
          body: JSON.stringify({
            name: trimmedName,
            usn: trimmedUsn,
            phone: phone.trim(),
            department: department.trim(),
          }),
        }
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Failed to update profile'
        );
      }

      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.',
        [
          {
            text: 'Done',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        'Profile update error:',
        error
      );

      Alert.alert(
        'Update Failed',
        error.message ||
          'Unable to update your profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
  }) => {
    return (
      <View
        style={{
          marginBottom: 18,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '900',
            color: '#64748B',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A8B2C1"
          editable={!loading}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 15,
            paddingHorizontal: 15,
            height: 52,
            color: '#111827',
            fontSize: 14,
            fontWeight: '600',
          }}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: '#F6F8FC',
      }}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 50,
        }}
      >
        {/* HEADER */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              marginRight: 13,
            }}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text
              style={{
                fontSize: 30,
                lineHeight: 34,
                color: '#111827',
              }}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '900',
                color: '#111827',
              }}
            >
              Edit Profile
            </Text>

            <Text
              style={{
                marginTop: 3,
                fontSize: 12,
                fontWeight: '600',
                color: '#94A3B8',
              }}
            >
              Update your student details
            </Text>
          </View>
        </View>

        {/* FORM */}

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}
        >
          {/* NAME */}

          {renderInput({
            label: 'FULL NAME',
            value: name,
            onChangeText: setName,
            placeholder: 'Enter your full name',
          })}

          {/* EMAIL */}

          <Text
            style={{
              fontSize: 11,
              fontWeight: '900',
              color: '#64748B',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            COLLEGE EMAIL
          </Text>

          <View
            style={{
              backgroundColor: '#F1F5F9',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 15,
              paddingHorizontal: 15,
              height: 52,
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                color: '#64748B',
                fontSize: 14,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {currentUser?.email ||
                'No email available'}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 10,
              color: '#94A3B8',
              marginTop: -10,
              marginBottom: 18,
            }}
          >
            Email is linked to your Firebase
            account and cannot be changed here.
          </Text>

          {/* USN */}

          {renderInput({
            label: 'USN',
            value: usn,
            onChangeText: setUsn,
            placeholder: 'Enter your USN',
            autoCapitalize: 'characters',
          })}

          {/* PHONE */}

          {renderInput({
            label: 'PHONE',
            value: phone,
            onChangeText: setPhone,
            placeholder: 'Enter your phone number',
            keyboardType: 'phone-pad',
          })}

          {/* DEPARTMENT */}

          {renderInput({
            label: 'DEPARTMENT',
            value: department,
            onChangeText: setDepartment,
            placeholder:
              'Example: Computer Science',
          })}

          {/* SAVE BUTTON */}

          <TouchableOpacity
            style={{
              height: 54,
              borderRadius: 16,
              backgroundColor: '#2563EB',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 4,
            }}
            activeOpacity={0.85}
            disabled={loading}
            onPress={handleSave}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '900',
                  letterSpacing: 0.3,
                }}
              >
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* SECURITY NOTE */}

        <View
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 16,
            backgroundColor: '#EFF6FF',
            borderWidth: 1,
            borderColor: '#DBEAFE',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '800',
              color: '#1D4ED8',
              marginBottom: 5,
            }}
          >
            Profile information
          </Text>

          <Text
            style={{
              fontSize: 11,
              lineHeight: 17,
              color: '#64748B',
            }}
          >
            Keep your USN and student information
            accurate. Your USN is used to identify
            your CampusSetu student account.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}