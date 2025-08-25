import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './CalculatorStyles';

interface CalculationResult {
  type: 'positive' | 'negative';
  percentage: string;
  classes?: number;
  classesNeeded?: number;
  totalAddedClasses?: number;
  fullWeeks?: number;
  remainingClasses?: number;
  newTotal?: number;
  newPercentage?: string;
  slotBreakdown?: { [key: string]: number };
  currentDay?: string;
}

interface WeeklySlots {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

const Calculator: React.FC = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  // State variables
  const [totalSlots, setTotalSlots] = useState<string>('');
  const [attendedSlots, setAttendedSlots] = useState<string>('');
  const [targetAttendance, setTargetAttendance] = useState<string>('75');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Weekly schedule state
  const [slots, setSlots] = useState<WeeklySlots>({
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  });

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start();

    // Continuous rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Pulse animation for interactive elements
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, []);

  const getCurrentDay = (): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date().getDay();
    return days[dayIndex];
  };

  const animateResult = () => {
    resultAnim.setValue(0);
    Animated.sequence([
      Animated.spring(resultAnim, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(resultAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(resultAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const calculateAttendance = async () => {
    const total = parseInt(totalSlots);
    const attended = parseInt(attendedSlots);
    const target = parseInt(targetAttendance);

    // Validation
    if (!total || total === 0) {
      setError('Total slots cannot be 0 or empty');
      animateError();
      return;
    }

    if (!attended && attended !== 0) {
      setError('Please enter attended slots');
      animateError();
      return;
    }

    if (attended > total) {
      setError('Attended slots cannot be more than total slots');
      animateError();
      return;
    }

    if (!target || target <= 0 || target > 100) {
      setError('Target attendance must be between 1 and 100');
      animateError();
      return;
    }

    setIsCalculating(true);
    setError('');
    setCalculationResult(null);
    animateButton();

    // Simulate calculation delay for better UX
    setTimeout(() => {
      const currentPercentage = (attended / total) * 100;

      if (currentPercentage >= target) {
        // Calculate how many classes can be bunked
        const possibleBunks = Math.floor(attended - (target * total) / 100);
        setCalculationResult({
          type: 'positive',
          percentage: currentPercentage.toFixed(2),
          classes: Math.max(0, possibleBunks),
        });
      } else {
        // Calculate how many additional classes are needed
        const classesNeeded = Math.ceil(
          (target * total - 100 * attended) / (100 - target)
        );

        const weeklySlots = Object.values(slots).reduce((sum, count) => sum + count, 0);
        const currentDay = getCurrentDay();
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const currentDayIndex = days.indexOf(currentDay);
        const orderedDays = [...days.slice(currentDayIndex + 1), ...days.slice(0, currentDayIndex + 1)];

        const slotBreakdown: { [key: string]: number } = {};
        days.forEach((day) => {
          slotBreakdown[day] = 0;
        });

        if (showSchedule && weeklySlots > 0) {
          const availableCapacity: { [key: string]: number } = {};
          Object.entries(slots).forEach(([day, count]) => {
            availableCapacity[day] = count > 0 ? count : 0;
          });

          const totalAvailableCapacity = Object.values(availableCapacity).reduce(
            (sum, count) => sum + count,
            0
          );

          if (totalAvailableCapacity > 0) {
            const weeksNeeded = Math.ceil(classesNeeded / totalAvailableCapacity);
            let remainingToAllocate = classesNeeded;

            for (let week = 0; week < weeksNeeded; week++) {
              const sortedDays = orderedDays
                .filter((day) => availableCapacity[day] > 0)
                .map((day) => [day, slots[day as keyof WeeklySlots]]);

              if (sortedDays.length === 0) break;

              if (week === 0) {
                sortedDays.forEach(([day, count]) => {
                  const dayKey = day as string;
                  if (remainingToAllocate > 0 && availableCapacity[dayKey] > 0) {
                    const proportion = (count as number) / weeklySlots;
                    const allocate = Math.min(
                      Math.ceil(totalAvailableCapacity * proportion),
                      availableCapacity[dayKey],
                      remainingToAllocate
                    );

                    slotBreakdown[dayKey] += allocate;
                    remainingToAllocate -= allocate;
                  }
                });
              }

              let index = 0;
              while (remainingToAllocate > 0 && index < sortedDays.length) {
                const [day] = sortedDays[index];
                const dayKey = day as string;

                if (
                  availableCapacity[dayKey] > 0 &&
                  slotBreakdown[dayKey] < availableCapacity[dayKey]
                ) {
                  slotBreakdown[dayKey] += 1;
                  remainingToAllocate -= 1;
                }

                index = (index + 1) % sortedDays.length;

                if (index === 0 && remainingToAllocate > 0) {
                  break;
                }
              }
            }
          }
        }

        const newTotal = total + classesNeeded;
        const newAttendance = (((attended + classesNeeded) / newTotal) * 100).toFixed(2);

        const totalAddedClasses = Object.values(slotBreakdown).reduce(
          (sum, count) => sum + count,
          0
        );
        const fullWeeks = showSchedule && weeklySlots > 0 
          ? Math.floor(totalAddedClasses / weeklySlots)
          : 0;
        const remainingClasses = showSchedule && weeklySlots > 0 
          ? totalAddedClasses % weeklySlots 
          : 0;

        setCalculationResult({
          type: 'negative',
          percentage: currentPercentage.toFixed(2),
          classesNeeded,
          totalAddedClasses,
          fullWeeks,
          remainingClasses,
          newTotal,
          newPercentage: newAttendance,
          slotBreakdown,
          currentDay,
        });
      }

      setIsCalculating(false);
      animateResult();
    }, 1500);
  };

  const handleSlotChange = (day: keyof WeeklySlots, value: string) => {
    const numValue = parseInt(value) || 0;
    setSlots((prevSlots) => ({
      ...prevSlots,
      [day]: numValue,
    }));
  };

  const totalWeeklySlots = Object.values(slots).reduce((sum, value) => sum + value, 0);

  const renderScheduleCard = () => (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { scale: scaleAnim },
            {
              rotateY: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '2deg'],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        >
          <Icon name="schedule" size={24} color="#A855F7" />
        </Animated.View>
        <Text style={styles.cardTitle}>Weekly Schedule</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditMode(!editMode)}
        >
          <Icon name={editMode ? "close" : "edit"} size={20} color="#A855F7" />
        </TouchableOpacity>
      </View>

      {editMode ? (
        <Animated.View 
          style={[
            styles.scheduleForm,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {Object.entries(slots).map(([day, count]) => (
            <Animated.View 
              key={day} 
              style={[
                styles.dayInput,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
              <TextInput
                style={styles.input}
                value={count.toString()}
                onChangeText={(value) => handleSlotChange(day as keyof WeeklySlots, value)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#6B7280"
              />
            </Animated.View>
          ))}
          <View style={styles.totalSlots}>
            <Text style={styles.totalText}>Total: {totalWeeklySlots} classes/week</Text>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.scheduleDisplay}>
          {Object.entries(slots).map(([day, count], index) => (
            <Animated.View 
              key={day} 
              style={[
                styles.dayDisplay,
                {
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, (index % 2 === 0 ? -1 : 1) * 20],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
              <Animated.Text 
                style={[
                  styles.dayCount,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {count}
              </Animated.Text>
            </Animated.View>
          ))}
          <View style={styles.totalDisplay}>
            <Text style={styles.totalDisplayText}>Total Weekly: {totalWeeklySlots}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );

  const renderResultCard = () => {
    if (!calculationResult) return null;

    return (
      <Animated.View
        style={[
          styles.resultCard,
          {
            opacity: resultAnim,
            transform: [
              {
                translateY: resultAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
              { scale: resultAnim },
              {
                rotateX: resultAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['15deg', '0deg'],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={
            calculationResult.type === 'positive'
              ? ['#059669', '#047857', '#065F46']
              : ['#DC2626', '#B91C1C', '#991B1B']
          }
          style={styles.resultGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.resultHeader}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                  { scale: pulseAnim },
                ],
              }}
            >
              <Icon
                name={calculationResult.type === 'positive' ? 'check-circle' : 'warning'}
                size={28}
                color="white"
              />
            </Animated.View>
            <Text style={styles.resultTitle}>
              Current: {calculationResult.percentage}%
            </Text>
          </View>

          {calculationResult.type === 'positive' ? (
            <Animated.Text 
              style={[
                styles.resultText,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              🎉 You can safely miss {calculationResult.classes} more{' '}
              {calculationResult.classes === 1 ? 'class' : 'classes'} while maintaining{' '}
              {targetAttendance}% attendance!
            </Animated.Text>
          ) : (
            <View>
              <Text style={styles.resultText}>
                📚 You need {calculationResult.classesNeeded} more{' '}
                {calculationResult.classesNeeded === 1 ? 'class' : 'classes'} to reach{' '}
                {targetAttendance}% attendance.
              </Text>

              {showSchedule && calculationResult.fullWeeks !== undefined && (
                <Animated.View 
                  style={[
                    styles.breakdownContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <Text style={styles.breakdownTitle}>Schedule Breakdown:</Text>
                  {calculationResult.fullWeeks > 0 && (
                    <Text style={styles.breakdownText}>
                      📅 {calculationResult.fullWeeks} full week{calculationResult.fullWeeks > 1 ? 's' : ''}
                      {calculationResult.remainingClasses! > 0 && 
                        ` + ${calculationResult.remainingClasses} extra class${calculationResult.remainingClasses! > 1 ? 'es' : ''}`
                      }
                    </Text>
                  )}
                  
                  {calculationResult.slotBreakdown && (
                    <View style={styles.dayBreakdown}>
                      {Object.entries(calculationResult.slotBreakdown)
                        .filter(([, count]) => count > 0)
                        .map(([day, count], index) => (
                          <Animated.View 
                            key={day} 
                            style={[
                              styles.dayBreakdownItem,
                              {
                                transform: [
                                  { 
                                    scale: fadeAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0.8, 1],
                                    })
                                  },
                                  {
                                    translateY: fadeAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [20, 0],
                                    }),
                                  },
                                ],
                                opacity: fadeAnim,
                              },
                            ]}
                          >
                            <Text style={styles.dayBreakdownText}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}: {count}
                            </Text>
                          </Animated.View>
                        ))}
                    </View>
                  )}
                </Animated.View>
              )}

              <Text style={styles.resultSubText}>
                📊 New total: {calculationResult.newTotal} classes → {calculationResult.newPercentage}%
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <LinearGradient 
        colors={['#1F2937', '#374151', '#4B5563']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [{ rotate: spin }],
            }}
          >
            <Icon name="calculate" size={32} color="#A855F7" />
          </Animated.View>
          <Text style={styles.headerTitle}>Attendance Calculator</Text>
          <Text style={styles.headerSubtitle}>Track your academic progress</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.mainCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim }, 
                { scale: scaleAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Slots</Text>
              <TextInput
                style={styles.mainInput}
                value={totalSlots}
                onChangeText={setTotalSlots}
                placeholder="Enter total classes"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Attended Slots</Text>
              <TextInput
                style={styles.mainInput}
                value={attendedSlots}
                onChangeText={setAttendedSlots}
                placeholder="Classes attended"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Attendance (%)</Text>
              <TextInput
                style={styles.mainInput}
                value={targetAttendance}
                onChangeText={setTargetAttendance}
                placeholder="75"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
            </View>
          </View>

          {error ? (
            <Animated.View 
              style={[
                styles.errorContainer,
                {
                  transform: [{ translateX: shakeAnim }],
                },
              ]}
            >
              <Icon name="error" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <TouchableOpacity
            style={[styles.calculateButton, isCalculating && styles.calculatingButton]}
            onPress={calculateAttendance}
            disabled={isCalculating}
          >
            <LinearGradient
              colors={['#A855F7', '#9333EA', '#7C3AED']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isCalculating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Animated.View
                  style={{
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  <Icon name="calculate" size={24} color="white" />
                </Animated.View>
              )}
              <Text style={styles.calculateButtonText}>
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {renderResultCard()}

        <TouchableOpacity
          style={styles.scheduleToggle}
          onPress={() => setShowSchedule(!showSchedule)}
        >
          <Animated.View
            style={{
              transform: [{ rotate: showSchedule ? '180deg' : '0deg' }],
            }}
          >
            <Icon 
              name={showSchedule ? "expand-less" : "expand-more"} 
              size={24} 
              color="#A855F7" 
            />
          </Animated.View>
          <Text style={styles.scheduleToggleText}>
            {showSchedule ? 'Hide' : 'Show'} Weekly Schedule
          </Text>
        </TouchableOpacity>

        {showSchedule && renderScheduleCard()}

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

export default Calculator;