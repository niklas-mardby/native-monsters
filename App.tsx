import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	FlatList,
	Modal,
	StyleSheet,
	LayoutAnimation,
	Platform,
	KeyboardAvoidingView,
	KeyboardTypeOptions,
} from "react-native";
import * as Crypto from "expo-crypto";

type Monster = {
	id: string;
	name: string;
	eyes: number;
	tentacles: number;
};

type MonsterFormValues = {
	name: string;
	eyes: string;
	tentacles: string;
};

type FormErrors = Partial<MonsterFormValues>;

const EMPTY_FORM: MonsterFormValues = { name: "", eyes: "", tentacles: "" };

const INITIAL_MONSTERS: Monster[] = [
	{ id: Crypto.randomUUID(), name: "Zoglorp", eyes: 4, tentacles: 8 },
	{ id: Crypto.randomUUID(), name: "Blibbex", eyes: 1, tentacles: 3 },
];

type MonsterCardProps = {
	monster: Monster;
	isExpanded: boolean;
	onToggle: (id: string) => void;
};

const MonsterCard = ({ monster, isExpanded, onToggle }: MonsterCardProps) => (
	<Pressable style={styles.card} onPress={() => onToggle(monster.id)}>
		<Text style={styles.monsterName}>{monster.name}</Text>
		{isExpanded && (
			<View style={styles.monsterDetails}>
				<Text style={styles.detailText}>👁️ Ögon: {monster.eyes}</Text>
				<Text style={styles.detailText}>
					🐙 Tentakler: {monster.tentacles}
				</Text>
			</View>
		)}
	</Pressable>
);

type FormFieldProps = {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	error?: string;
	keyboardType?: KeyboardTypeOptions;
};

const FormField = ({
	label,
	value,
	onChangeText,
	error,
	keyboardType = "default",
}: FormFieldProps) => (
	<View style={styles.fieldWrapper}>
		<Text style={styles.label}>{label}</Text>
		<TextInput
			style={[styles.input, error ? styles.inputError : null]}
			value={value}
			onChangeText={onChangeText}
			keyboardType={keyboardType}
			autoCapitalize="none"
		/>
		{error && <Text style={styles.errorText}>{error}</Text>}
	</View>
);

export default function App() {
	const [monsters, setMonsters] = useState<Monster[]>(INITIAL_MONSTERS);
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [form, setForm] = useState<MonsterFormValues>(EMPTY_FORM);
	const [errors, setErrors] = useState<FormErrors>({});

	const handleToggle = (id: string): void => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setExpandedId(expandedId === id ? null : id);
	};

	const updateField = (
		field: keyof MonsterFormValues,
		value: string,
	): void => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	};

	const validate = (): boolean => {
		const newErrors: FormErrors = {};

		if (form.name.trim().length === 0) {
			newErrors.name = "Namn krävs";
		}

		const eyes = Number.parseInt(form.eyes, 10);
		if (
			!form.eyes ||
			Number.isNaN(eyes) ||
			eyes < 0 ||
			!Number.isInteger(eyes)
		) {
			newErrors.eyes = "Måste vara ett positivt heltal";
		}

		const tentacles = Number.parseInt(form.tentacles, 10);
		if (
			!form.tentacles ||
			Number.isNaN(tentacles) ||
			tentacles < 0 ||
			!Number.isInteger(tentacles)
		) {
			newErrors.tentacles = "Måste vara ett positivt heltal";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAdd = (): void => {
		if (!validate()) return;

		const newMonster: Monster = {
			id: Crypto.randomUUID(),
			name: form.name.trim(),
			eyes: Number.parseInt(form.eyes, 10),
			tentacles: Number.parseInt(form.tentacles, 10),
		};

		setMonsters((prev) => [...prev, newMonster]);
		handleClose();
	};

	const handleClose = (): void => {
		setForm(EMPTY_FORM);
		setErrors({});
		setModalVisible(false);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>👾 native-monsters 👾</Text>

			<FlatList
				data={monsters}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<MonsterCard
						monster={item}
						isExpanded={expandedId === item.id}
						onToggle={handleToggle}
					/>
				)}
			/>

			<Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
				<Text style={styles.fabText}>+</Text>
			</Pressable>

			<Modal visible={modalVisible} animationType="slide" transparent>
				<KeyboardAvoidingView
					style={styles.modalOverlay}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<View style={styles.modalContent}>
						<Text style={styles.modalHeading}>Nytt monster</Text>

						<FormField
							label="Namn"
							value={form.name}
							onChangeText={(text) => updateField("name", text)}
							error={errors.name}
						/>
						<FormField
							label="Antal ögon"
							value={form.eyes}
							onChangeText={(text) => updateField("eyes", text)}
							error={errors.eyes}
							keyboardType="numeric"
						/>
						<FormField
							label="Antal tentakler"
							value={form.tentacles}
							onChangeText={(text) => updateField("tentacles", text)}
							error={errors.tentacles}
							keyboardType="numeric"
						/>

						<View style={styles.modalButtons}>
							<Pressable
								style={[styles.button, styles.cancelButton]}
								onPress={handleClose}
							>
								<Text style={styles.buttonText}>Avbryt</Text>
							</Pressable>
							<Pressable
								style={[styles.button, styles.confirmButton]}
								onPress={handleAdd}
							>
								<Text style={styles.buttonText}>Lägg till</Text>
							</Pressable>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f0f0",
		paddingTop: 60,
		paddingHorizontal: 16,
	},
	heading: {
		fontSize: 26,
		fontWeight: "bold",
		marginBottom: 16,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 16,
		marginBottom: 10,
	},
	monsterName: {
		fontSize: 18,
		fontWeight: "600",
	},
	monsterDetails: {
		marginTop: 10,
		gap: 4,
	},
	detailText: {
		fontSize: 15,
		color: "#555",
	},
	fab: {
		position: "absolute",
		bottom: 32,
		right: 24,
		backgroundColor: "#5C6BC0",
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
	fabText: {
		fontSize: 32,
		color: "#fff",
		lineHeight: 36,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 24,
		gap: 8,
	},
	modalHeading: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 8,
	},
	fieldWrapper: {
		marginBottom: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		marginBottom: 4,
		color: "#333",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		fontSize: 16,
		backgroundColor: "#fafafa",
	},
	inputError: {
		borderColor: "#e53935",
	},
	errorText: {
		color: "#e53935",
		fontSize: 12,
		marginTop: 2,
	},
	modalButtons: {
		flexDirection: "row",
		gap: 12,
		marginTop: 8,
	},
	button: {
		flex: 1,
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: "#ccc",
	},
	confirmButton: {
		backgroundColor: "#5C6BC0",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
});
