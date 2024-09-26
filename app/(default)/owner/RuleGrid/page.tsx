"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RuleGrid.css";

interface RuleDTO {
    id: string;
    name: string;
    condition: string;
    action: string;
    ruleType: string;
    selectedHotel?: string;
    checkInDate?: string;
    checkOutDate?: string;
}

const RuleGrid: React.FC = () => {
    const [rules, setRules] = useState<RuleDTO[]>([]);
    const [editingRule, setEditingRule] = useState<RuleDTO | null>(null);
    const [newRuleName, setNewRuleName] = useState<string>("");
    const [newRuleCondition, setNewRuleCondition] = useState<string>("");
    const [newRuleAction, setNewRuleAction] = useState<string>("");
    const [ruleType, setRuleType] = useState<string>("Hotel");
    const [selectedHotel, setSelectedHotel] = useState<string>("");
    const [checkInDate, setCheckInDate] = useState<string>("");
    const [checkOutDate, setCheckOutDate] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const hotelsList = [
        { id: 1, name: "Hotel Sunshine" },
        { id: 2, name: "Grand Palace" },
        { id: 3, name: "Seaside Inn" },
        { id: 4, name: "Mountain View Resort" }
    ];

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/hotel/rules");
            setRules(response.data);
        } catch (error) {
            console.error("Error fetching rules:", error);
            setErrorMessage("Failed to fetch rules.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirmDeleteId) {
            try {
                await axios.delete(`http://localhost:8080/api/hotel/rules/${confirmDeleteId}`);
                setRules(rules.filter((rule) => rule.id !== confirmDeleteId));
                setSuccessMessage("Rule deleted successfully.");
                setConfirmDeleteId(null);
            } catch (error) {
                console.error("Error deleting rule:", error);
                setErrorMessage("Failed to delete rule.");
            }
        }
    };

    const handleEdit = (rule: RuleDTO) => {
        setEditingRule(rule);
        setNewRuleName(rule.name);
        setNewRuleCondition(rule.condition);
        setNewRuleAction(rule.action);
        setRuleType(rule.ruleType || "Hotel");
        setSelectedHotel(rule.selectedHotel || "");
        setCheckInDate(rule.checkInDate || "");
        setCheckOutDate(rule.checkOutDate || "");
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleUpdate = async () => {
        if (!editingRule || !editingRule.id) {
            setErrorMessage("Failed to update rule: No rule ID provided.");
            return;
        }

        const updatedRule = {
            name: newRuleName,
            condition: newRuleCondition,
            action: newRuleAction,
            ruleType,
            selectedHotel,
            checkInDate,
            checkOutDate
        };

        try {
            const response = await axios.put(
                `http://localhost:8080/api/hotel/rules/${editingRule.id}`,
                updatedRule
            );

            if (response.status === 200) {
                setRules(
                    rules.map((rule) =>
                        rule.id === editingRule.id ? { ...rule, ...updatedRule } : rule
                    )
                );
                resetForm();
                setSuccessMessage("Rule updated successfully.");
            } else {
                setErrorMessage("Failed to update rule: Rule not found.");
            }
        } catch (error) {
            console.error("Error updating rule:", error);
            setErrorMessage("Failed to update rule.");
        }
    };

    const handleAdd = async () => {
        const newRule = {
            name: newRuleName,
            condition: newRuleCondition,
            action: newRuleAction,
            ruleType,
            selectedHotel,
            checkInDate,
            checkOutDate
        };

        try {
            const response = await axios.post(
                "http://localhost:8080/api/hotel/rules",
                newRule
            );
            setRules([...rules, response.data]);
            resetForm();
            setSuccessMessage("Rule added successfully.");
        } catch (error) {
            console.error("Error adding rule:", error);
            setErrorMessage("Failed to add rule.");
        }
    };

    const resetForm = () => {
        setEditingRule(null);
        setNewRuleName("");
        setNewRuleCondition("");
        setNewRuleAction("");
        setRuleType("Hotel");
        setSelectedHotel("");
        setCheckInDate("");
        setCheckOutDate("");
        setSuccessMessage("");
        setErrorMessage("");
    };

    const handleConfirmDelete = (id: string) => {
        setConfirmDeleteId(id);
    };

    return (
        <div className="rule-grid-container">
            <h1 className="rule-grid-heading">Rules Management</h1>


            {errorMessage && <div className="message error-message">{errorMessage}</div>}
            {successMessage && <div className="message success-message">{successMessage}</div>}


            <div className="rule-form">
                <input
                    type="text"
                    placeholder="Rule Name"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="rule-input"
                />
                <textarea
                    placeholder="Rule Condition"
                    value={newRuleCondition}
                    onChange={(e) => setNewRuleCondition(e.target.value)}
                    className="rule-textarea"
                ></textarea>
                <textarea
                    placeholder="Rule Action"
                    value={newRuleAction}
                    onChange={(e) => setNewRuleAction(e.target.value)}
                    className="rule-textarea"
                ></textarea>


                <div className="rule-type-hotel-container">

                    <div className="rule-type-container">
                        <label htmlFor="rule-type-select">Type: </label>
                        <select
                            id="rule-type-select"
                            value={ruleType}
                            onChange={(e) => setRuleType(e.target.value)}
                            className="rule-dropdown"
                        >
                            <option value="Hotel">Hotel</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Cafe">Cafe</option>
                        </select>
                    </div>

                    {ruleType === 'Hotel' && (
                        <div className="hotel-selection-container">
                            <label htmlFor="hotel-select">Select Hotel: </label>
                            <select
                                id="hotel-select"
                                value={selectedHotel}
                                onChange={(e) => setSelectedHotel(e.target.value)}
                                className="rule-dropdown"
                            >
                                <option value="">Select a hotel</option>
                                {hotelsList.map((hotel) => (
                                    <option key={hotel.id} value={hotel.name}>
                                        {hotel.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>


                {ruleType === 'Hotel' && (
                    <div className="date-picker-container">
                        <div className="date-input-container">
                            <label>Check-in Date: </label>
                            <input
                                type="date"
                                value={checkInDate}
                                onChange={(e) => setCheckInDate(e.target.value)}
                                className="date-input"
                            />
                        </div>

                        <div className="date-input-container">
                            <label>Check-out Date: </label>
                            <input
                                type="date"
                                value={checkOutDate}
                                onChange={(e) => setCheckOutDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={editingRule ? handleUpdate : handleAdd}
                    className="rule-button"
                >
                    {editingRule ? "Update Rule" : "Add Rule"}
                </button>
                {editingRule && (
                    <button onClick={resetForm} className="rule-button cancel-button">
                        Cancel
                    </button>
                )}
            </div>

            <table className="rule-table">
                <thead>
                    <tr>
                        <th>Rule Name</th>
                        <th>Condition</th>
                        <th>Action</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rules.map((rule) => (
                        <tr key={rule.id}>
                            <td>{rule.name}</td>
                            <td>{rule.condition}</td>
                            <td>{rule.action}</td>
                            <td>
                                <button
                                    onClick={() => handleEdit(rule)}
                                    className="table-button edit-button"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleConfirmDelete(rule.id)}
                                    className="table-button delete-button"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {confirmDeleteId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete this rule?</p>
                        <button onClick={() => handleDelete(confirmDeleteId)} className="modal-button delete-button">Delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="modal-button cancel-button">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuleGrid;
