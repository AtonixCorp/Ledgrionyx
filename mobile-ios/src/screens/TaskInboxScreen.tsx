import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { useEnterprise } from '../context/EnterpriseContext';
import { colors } from '../theme/colors';

function relativeDueDate(value?: string) {
    if (!value) {
        return 'No due date';
    }

    const delta = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
    if (delta === 0) {
        return 'Due today';
    }
    if (delta > 0) {
        return `Due in ${delta}d`;
    }
    return `${Math.abs(delta)}d overdue`;
}

export default function TaskInboxScreen() {
    const { tasks, startTask, completeTask } = useEnterprise();
    const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);

    const runAction = async (taskId: number, action: 'start' | 'complete') => {
        setPendingTaskId(taskId);
        try {
            if (action === 'start') {
                await startTask(taskId);
            } else {
                await completeTask(taskId);
            }
        } catch (error) {
            Alert.alert('Task update failed', 'The task could not be updated right now.');
        } finally {
            setPendingTaskId(null);
        }
    };

    return (
        <Screen>
            <Text style={styles.header}>Task Inbox</Text>
            <Text style={styles.subheader}>Operational tasks assigned to your account.</Text>
            {tasks.length === 0 ? <Text style={styles.empty}>No open tasks right now.</Text> : null}
            {tasks.map((task) => (
                <View key={task.id} style={styles.card}>
                    <View style={styles.topRow}>
                        <Text style={styles.title}>{task.title}</Text>
                        <View style={[styles.badge, task.priority === 'high' || task.priority === 'urgent' ? styles.badgeHigh : styles.badgeMuted]}>
                            <Text style={[styles.badgeText, task.priority === 'high' || task.priority === 'urgent' ? styles.badgeTextHigh : undefined]}>{task.priority || task.state || 'open'}</Text>
                        </View>
                    </View>
                    {task.summary ? <Text style={styles.summary}>{task.summary}</Text> : null}
                    <Text style={styles.meta}>{[relativeDueDate(task.due_date), task.department_name, task.cost_center].filter(Boolean).join(' · ')}</Text>
                    <View style={styles.actions}>
                        <Pressable style={styles.secondaryButton} onPress={() => runAction(task.id, 'start')} disabled={pendingTaskId === task.id}>
                            <Text style={styles.secondaryButtonText}>{pendingTaskId === task.id ? 'Updating…' : 'Start'}</Text>
                        </Pressable>
                        <Pressable style={styles.primaryButton} onPress={() => runAction(task.id, 'complete')} disabled={pendingTaskId === task.id}>
                            <Text style={styles.primaryButtonText}>{pendingTaskId === task.id ? 'Updating…' : 'Complete'}</Text>
                        </Pressable>
                    </View>
                </View>
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: { color: colors.ink, fontSize: 28, fontWeight: '800' },
    subheader: { color: colors.muted, fontSize: 14, marginBottom: 12 },
    empty: { color: colors.muted, fontSize: 14 },
    card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 10 },
    topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
    title: { color: colors.ink, fontSize: 17, fontWeight: '800', flex: 1 },
    summary: { color: colors.muted, fontSize: 14, lineHeight: 20 },
    meta: { color: colors.muted, fontSize: 12, fontWeight: '700' },
    actions: { flexDirection: 'row', gap: 10 },
    primaryButton: { flex: 1, backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
    primaryButtonText: { color: '#fff', fontWeight: '800' },
    secondaryButton: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
    secondaryButtonText: { color: colors.ink, fontWeight: '700' },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    badgeHigh: { backgroundColor: 'rgba(196, 30, 58, 0.12)' },
    badgeMuted: { backgroundColor: colors.surfaceAlt },
    badgeText: { color: colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    badgeTextHigh: { color: colors.danger },
});