import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: '#18181b',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  topSpacer: {
    height: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    backgroundColor: '#23232b',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  headerButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  searchBar: {
    backgroundColor: '#23232b',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2d2d34',
  },
  searchInput: {
    fontSize: 16,
    color: '#fff',
  },
  tabsRow: {
    marginBottom: 28,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#23232b',
    borderWidth: 1,
    borderColor: '#2d2d34',
  },
  tabSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tabText: {
    color: '#e5e7eb',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextSelected: {
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  noEventsText: {
    color: '#a1a1aa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  cardGradient: {
    borderRadius: 18,
    marginBottom: 16,
    padding: 2,
  },
  eventCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#23232b',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#23232b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    color: '#a1a1aa',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  eventCategory: {
    fontSize: 12,
    color: '#ec4899',
    backgroundColor: '#23232b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  eventDescription: {
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetail: {
    color: '#a1a1aa',
    fontSize: 12,
    marginBottom: 4,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 16,
    marginTop: 12,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#18181b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#23232b',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#a1a1aa',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#23232b',
    borderWidth: 1,
    borderColor: '#2d2d34',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#23232b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2d2d34',
  },
  categoryOptionSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryOptionText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryOptionTextSelected: {
    color: '#fff',
  },
  dateTimeButton: {
    backgroundColor: '#23232b',
    borderWidth: 1,
    borderColor: '#2d2d34',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#2d2d34',
    borderStyle: 'dashed',
    borderRadius: 12,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23232b',
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  imagePickerText: {
    color: '#a1a1aa',
    fontSize: 16,
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#71717a',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;