"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RuleForm.css";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const RuleForm = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [rule, setRule] = useState({
    ruleName: "",
    condition: "",
    action: "",
    active: false,
    startDate: null,
    endDate: null,
  });
  const [templates, setTemplates] = useState({});
  const [rules, setRules] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [ruleId, setRuleId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const drool_server_url = process.env.NEXT_PUBLIC_DROOLS_SERVER_URL || "http://localhost:8081";
  console.log('drool_server_url', drool_server_url)

  const regexPatterns = {
    Hotel: /^Hotel\(hotelName == "([^"]+)", checkInTime >= "([^"]+)", checkOutTime <= "([^"]+)"\)$/,
    PageNavigation: /^PageNavigation\("([^"]+)"\)$/,
    CustomerSegment: /^CustomerSegment\("([^"]+)"\)$/,
    ComponentVisibility: /^(?:page == "([^"]+)"\s+&&\s+componentName == "([^"]+)"\s+&&\s+customerSegment == "([^"]+")$)/,
  };

  
  const ruleNameMapping = {
    "Customer Segment Pricing Rule": "customerSegmentPricing",
    "Hotel Price Rule": "hotel",
    "Page Navigation Rule": "pageNavigation",
    "Component Visibility Rule": "componentVisibility",
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        console.log('being called here')
        const response = await axios.get(`${drool_server_url}/api/rules/templates`);
        console.log('response data is', response)
        setTemplates(response.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchRules();
  }, [selectedCategory]);

  const fetchRules = async () => {
    if (!selectedCategory) return;
    try {
      const response = await axios.get(`${drool_server_url}/api/rules/${selectedCategory}`);
      setRules(response.data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setSelectedTemplate("");
    resetForm();
  };

  const handleTemplateChange = (event) => {
    const action = event.target.value;
    setSelectedTemplate(action);

    const selectedTemplateData = templates[selectedCategory]?.find((template) => template.action === action);

    if (selectedTemplateData) {
      setRule({
        ...rule,
        ruleName: selectedTemplateData.templateName,
        condition: selectedTemplateData.condition,
        action: action,
      });
    }
  };

  const handleRuleChange = (event) => {
    const { name, value } = event.target;
    setRule({ ...rule, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setRule({ ...rule, [field]: date });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    
    if (!selectedCategory || !selectedTemplate || !rule.ruleName || !rule.condition || !rule.action || !rule.startDate || !rule.endDate) {
      setErrorMessage("Please fill in all fields before submitting.");
      return;
    }


    let pattern;
    let errorMessage;

    switch (selectedCategory) {
      case "Hotel Price Rule":
        pattern = /^Hotel\(hotelName == "([^"]+)", checkInTime >= "([^"]+)", checkOutTime <= "([^"]+)"\)$/;
        errorMessage = 'Condition must match the pattern: Hotel(hotelName == "name", checkInTime >= "date", checkOutTime <= "date")';
        break;
      case "Page Navigation Rule":
        pattern = /^PageNavigation\((.+)\)$/;
        errorMessage = 'Condition must match the pattern:PageNavigation(pageType == "pageName", userRole == "userRoleName")';
        break;
      case "Customer Segment Pricing Rule":
        pattern = /^CustomerSegment\((.+)\)$/;
        errorMessage = 'Condition must match the pattern: CustomerSegment(CustomerType) && BookingType(Type)';
        break;
      case "Component Visibility Rule":
        pattern = /^(?:page == "([^"]+)"\s+&&\s+componentName == "([^"]+)"\s+&&\s+customerSegment == "([^"]+")$)/;
        errorMessage = 'Condition must match the pattern: page == "pageName" && componentName == "componentName" && customerSegment == "segmentName"';
        break;
      default:
        setErrorMessage("Invalid category selected.");
        return;
    }

    if (!pattern.test(rule.condition)) {
      setErrorMessage(errorMessage);
      return;
    }

  
    const template = selectedCategory;
    const ruleData = {
      name: rule.ruleName,
      condition: rule.condition,
      action: rule.action,
      active: rule.active,
      startDate: rule.startDate.toISOString(),
      endDate: rule.endDate.toISOString(),
    };

   
    const ruleName = ruleNameMapping[selectedCategory];
    if (!ruleName) {
      setErrorMessage("Invalid category selected.");
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`${drool_server_url}/api/rules/${template}/${ruleId}`, ruleData);

        setRules((prevRules) => prevRules.map((r) => (r.id === ruleId ? { ...r, ...ruleData } : r)));
        setSuccessMessage("Rule updated successfully!");
      } else {
    
        await axios.post(`${drool_server_url}/api/rules/${template}/${ruleName}`, ruleData);
        setSuccessMessage("Rule created successfully!");
        fetchRules();
      }
      resetForm();
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Error submitting rule: " + error.message);
    }
  };

  const handleEdit = (ruleData) => {
    setRule({
      ruleName: ruleData.name || ruleData.ruleName,
      condition: ruleData.condition,
      action: ruleData.action,
      active: ruleData.active,
      startDate: new Date(ruleData.startDate),
      endDate: new Date(ruleData.endDate),
    });

    setSelectedCategory(ruleData.template);
    setSelectedTemplate(ruleData.action);
    setIsEditing(true);
    setRuleId(ruleData.id);
    setShowEditModal(true);
  };

  const handleDelete = (ruleData) => {
    setRuleId(ruleData.id);
    setSelectedCategory(ruleData.template);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const template = selectedCategory;
    if (!template || !ruleId) {
      setErrorMessage("Invalid category or rule ID. Please try again.");
      return;
    }

    try {
      await axios.delete(`${drool_server_url}/api/rules/${template}/${ruleId}`);
      setSuccessMessage("Rule deleted successfully!");
      fetchRules();
      setShowDeleteModal(false);
    } catch (error) {
      setErrorMessage("Error deleting rule: " + error.message);
    }
  };

  const resetForm = () => {
    setRule({
      ruleName: "",
      condition: "",
      action: "",
      active: false,
      startDate: null,
      endDate: null,
    });
    setIsEditing(false);
    setSuccessMessage("");
    setErrorMessage("");
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedTemplate("");
  };

    return (
    <div className="app-container">
      <h1>Rule Management</h1>
      <form onSubmit={handleSubmit} className="rule-form">
        <div className="form-group combined-row">
          <div className="form-group">
            <label htmlFor="category-select">Category</label>
            <select id="category-select" value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">Select Category</option>
              {Object.keys(templates).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div className="form-group">
              <label htmlFor="template-select">Template</label>
              <select id="template-select" value={selectedTemplate} onChange={handleTemplateChange}>
                <option value="">Select Template</option>
                {templates[selectedCategory]?.map((template) => (
                  <option key={template.action} value={template.action}>
                    {template.action}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        {selectedCategory && (
          <div className="form-group">
            <label htmlFor="rule-name">Rule Name</label>
            <input
              id="rule-name"
              type="text"
              name="ruleName"
              value={rule.ruleName}
              onChange={handleRuleChange}
              required
            />
          </div>
        )}

        {selectedCategory && (
          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <textarea
              id="condition"
              name="condition"
              value={rule.condition}
              onChange={handleRuleChange}
              required
              className="large-textarea"
            />
          </div>
        )}

        {selectedCategory && (
          <div className="form-group">
            <label htmlFor="action">Action</label>
            <textarea
              id="action"
              name="action"
              value={rule.action}
              onChange={handleRuleChange}
              required
              className="large-textarea"
            />
          </div>
        )}

        {selectedCategory && (
          <div className="form-group combined-row">
            <div className="form-group">
              <label>Active</label>
              <input
                type="checkbox"
                name="active"
                checked={rule.active}
                onChange={() => setRule({ ...rule, active: !rule.active })}
              />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <DatePicker
                selected={rule.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                dateFormat="yyyy/MM/dd"
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <DatePicker
                selected={rule.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                dateFormat="yyyy/MM/dd"
                required
              />
            </div>
          </div>
        )}

        <button type="submit" className="submit-button">
          {isEditing ? "Update Rule" : "Create Rule"}
        </button>

        {successMessage && (
          <p style={{ color: "green", fontWeight: "bold", fontSize: "20px", marginTop: "20px" }}>
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p style={{ color: "red", fontWeight: "bold", fontSize: "20px", marginTop: "20px" }}>
            {errorMessage}
          </p>
        )}
      </form>

      {rules.length > 0 && (
        <div className="rules-table">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Rule Name</th>
                <th>Condition</th>
                <th>Action</th>
                <th>Active</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((ruleData, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#e6e6e77a',
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{ruleData.ruleName || ruleData.name}</td>
                  <td>{ruleData.condition}</td>
                  <td>{ruleData.action}</td>
                  <td>{ruleData.active ? "Yes" : "No"}</td>
                  <td>{new Date(ruleData.startDate).toLocaleDateString()}</td>
                  <td>{new Date(ruleData.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className="icon-button" onClick={() => handleEdit(ruleData)}>
                      <FaEdit style={{ color: "blue" }} />
                    </span>
                    <span className="icon-button" onClick={() => handleDelete(ruleData)}>
                      <FaTrash style={{ color: "red" }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Editing */}
      {showEditModal && (
        <div className="custom-modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit Rule' : 'Create Rule'}</h2>
            <form onSubmit={handleSubmit} className="rule-form">
              <div className="form-group">
                <label htmlFor="rule-name">Rule Name</label>
                <input
                  id="rule-name"
                  type="text"
                  name="ruleName"
                  value={rule.ruleName}
                  onChange={handleRuleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition</label>
                <textarea
                  id="condition"
                  name="condition"
                  value={rule.condition}
                  onChange={handleRuleChange}
                  required
                  className="large-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="action">Action</label>
                <textarea
                  id="action"
                  name="action"
                  value={rule.action}
                  onChange={handleRuleChange}
                  required
                  className="large-textarea"
                />
              </div>

              <div className="form-group combined-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <DatePicker
                    selected={rule.startDate}
                    onChange={(date) => handleDateChange(date, 'startDate')}
                    dateFormat="yyyy/MM/dd"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <DatePicker
                    selected={rule.endDate}
                    onChange={(date) => handleDateChange(date, 'endDate')}
                    dateFormat="yyyy/MM/dd"
                    required
                  />
                </div>
              </div>

              <div className="button-row">
                <button type="submit" className="submit-button">
                  {isEditing ? 'Update Rule' : 'Create Rule'}
                </button>
                <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {showDeleteModal && (
        <div className="custom-modal">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this rule?</p>
            <div className="button-row">
              <button className="delete-button" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button type="button" className="cancel-button" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleForm;



