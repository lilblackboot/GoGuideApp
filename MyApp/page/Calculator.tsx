import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

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
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCurrentDay = (): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date().getDay();
    return days[dayIndex];
  };

  const animateResult = () => {
    resultAnim.setValue(0);
    Animated.spring(resultAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const calculateAttendance = async () => {
    const total = parseInt(totalSlots);
    const attended = parseInt(attendedSlots);
    const target = parseInt(targetAttendance);

    // Validation
    if (!total || total === 0) {
      setError('Total slots cannot be 0 or empty');
      return;
    }

    if (!attended && attended !== 0) {
      setError('Please enter attended slots');
      return;
    }

    if (attended > total) {
      setError('Attended slots cannot be more than total slots');
      return;
    }

    if (!target || target <= 0 || target > 100) {
      setError('Target attendance must be between 1 and 100');
      return;
    }

    setIsCalculating(true);
    setError('');
    setCalculationResult(null);

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
    }, 1200);
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
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Icon name="schedule" size={24} color="#6366F1" />
        <Text style={styles.cardTitle}>Weekly Schedule</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditMode(!editMode)}
        >
          <Icon name={editMode ? "close" : "edit"} size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {editMode ? (
        <View style={styles.scheduleForm}>
          {Object.entries(slots).map(([day, count]) => (
            <View key={day} style={styles.dayInput}>
              <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
              <TextInput
                style={styles.input}
                value={count.toString()}
                onChangeText={(value) => handleSlotChange(day as keyof WeeklySlots, value)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          ))}
          <View style={styles.totalSlots}>
            <Text style={styles.totalText}>Total: {totalWeeklySlots} classes/week</Text>
          </View>
        </View>
      ) : (
        <View style={styles.scheduleDisplay}>
          {Object.entries(slots).map(([day, count]) => (
            <View key={day} style={styles.dayDisplay}>
              <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
              <Text style={styles.dayCount}>{count}</Text>
            </View>
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
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={
            calculationResult.type === 'positive'
              ? ['#10B981', '#059669']
              : ['#F59E0B', '#D97706']
          }
          style={styles.resultGradient}
        >
          <View style={styles.resultHeader}>
            <Icon
              name={calculationResult.type === 'positive' ? 'check-circle' : 'warning'}
              size={28}
              color="white"
            />
            <Text style={styles.resultTitle}>
              Current: {calculationResult.percentage}%
            </Text>
          </View>

          {calculationResult.type === 'positive' ? (
            <Text style={styles.resultText}>
              🎉 You can safely miss {calculationResult.classes} more{' '}
              {calculationResult.classes === 1 ? 'class' : 'classes'} while maintaining{' '}
              {targetAttendance}% attendance!
            </Text>
          ) : (
            <View>
              <Text style={styles.resultText}>
                📚 You need {calculationResult.classesNeeded} more{' '}
                {calculationResult.classesNeeded === 1 ? 'class' : 'classes'} to reach{' '}
                {targetAttendance}% attendance.
              </Text>

              {showSchedule && calculationResult.fullWeeks !== undefined && (
                <View style={styles.breakdownContainer}>
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
                        .map(([day, count]) => (
                          <View key={day} style={styles.dayBreakdownItem}>
                            <Text style={styles.dayBreakdownText}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}: {count}
                            </Text>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Icon name="calculate" size={32} color="white" />
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
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
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
                keyboardType="numeric"
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Icon name="error" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.calculateButton, isCalculating && styles.calculatingButton]}
            onPress={calculateAttendance}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Icon name="calculate" size={24} color="white" />
            )}
            <Text style={styles.calculateButtonText}>
              {isCalculating ? 'Calculating...' : 'Calculate'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {renderResultCard()}

        <TouchableOpacity
          style={styles.scheduleToggle}
          onPress={() => setShowSchedule(!showSchedule)}
        >
          <Icon 
            name={showSchedule ? "expand-less" : "expand-more"} 
            size={24} 
            color="#6366F1" 
          />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -15,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  mainInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    fontSize: 14,
  },
  calculateButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  calculatingButton: {
    opacity: 0.7,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  resultGradient: {
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  resultSubText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 10,
  },
  breakdownContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  breakdownTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  breakdownText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 10,
  },
  dayBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayBreakdownItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dayBreakdownText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  scheduleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleToggleText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginLeft: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scheduleForm: {
    gap: 15,
  },
  dayInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
  },
  totalSlots: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    textAlign: 'center',
  },
  scheduleDisplay: {
    gap: 12,
  },
  dayDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 16,
    color: '#374151',
    textTransform: 'capitalize',
  },
  dayCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  totalDisplay: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    textAlign: 'center',
  },
  footer: {
    height: 40,
  },
});

export default Calculator;