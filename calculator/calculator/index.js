// Query elements
const display = document.getElementById("textarea");
const buttonsContainer = document.getElementById("btn");
const clearAllButton = document.getElementById("ac");
const equalsButton = document.getElementById("equal");

// Internal state
let expression = "";

function setDisplay(value) {
  display.value = value;
}

function appendToExpression(token) {
  // Prevent multiple operators in a row (except minus for negatives after operator or at start)
  const isOperator = /[+\-*/%]/.test(token);
  const lastChar = expression.slice(-1);
  if (isOperator) {
    if (expression === "" && token !== "-") return; // cannot start with operator except '-'
    if (/[+\-*/%]/.test(lastChar)) {
      // Replace last operator (allow turning +/* into - if user hits -)
      expression = expression.slice(0, -1) + token;
      setDisplay(expression);
      return;
    }
  }
  expression += token;
  setDisplay(expression);
}

function clearAll() {
  expression = "";
  setDisplay("");
}

function backspace() {
  expression = expression.slice(0, -1);
  setDisplay(expression);
}

function evaluateExpression() {
  if (!expression) return;
  try {
    // Convert symbols from icons to JS operators if present
    let safeExpr = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/%/g, "/100*"); // percentage of previous number

    // Disallow invalid trailing operators
    if (/[+\-*/.]$/.test(safeExpr)) {
      safeExpr = safeExpr.slice(0, -1);
    }

    // Evaluate using Function constructor for slightly safer eval
    // Only allow digits, operators, parentheses and dot
    if (!/^[-+*/().\d\s]*$/.test(safeExpr)) {
      throw new Error("Invalid input");
    }
    const result = Function(`"use strict"; return (${safeExpr})`)();
    expression = String(result);
    setDisplay(expression);
  } catch (err) {
    setDisplay("Error");
    expression = "";
  }
}

// Click handling via event delegation
buttonsContainer.addEventListener("click", (e) => {
  const target = e.target.closest("button");
  if (!target) return;
  const icon = target.querySelector("i");
  let text = target.textContent.trim();

  // Map icon buttons to symbols
  if (icon) {
    if (icon.classList.contains("fa-delete-left")) {
      backspace();
      return;
    }
    if (icon.classList.contains("fa-divide")) {
      text = "/";
    }
    if (icon.classList.contains("fa-xmark")) {
      text = "*";
    }
  }

  if (target.id === "ac") {
    clearAll();
    return;
  }
  if (target.id === "equal") {
    evaluateExpression();
    return;
  }

  appendToExpression(text);
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (/[0-9.]/.test(key)) {
    appendToExpression(key);
    return;
  }
  if (["+", "-", "*", "/", "%"].includes(key)) {
    appendToExpression(key);
    return;
  }
  if (key === "Enter" || key === "=") {
    evaluateExpression();
    return;
  }
  if (key === "Backspace") {
    backspace();
    return;
  }
  if (key.toLowerCase() === "c" && (e.ctrlKey || e.metaKey)) return; // allow copy
  if (key.toLowerCase() === "v" && (e.ctrlKey || e.metaKey)) return; // allow paste
  if (key.toLowerCase() === "a" && (e.ctrlKey || e.metaKey)) return; // allow select all
});

// Prevent manual typing directly in textarea to keep consistent behavior
display.addEventListener("keydown", (e) => {
  // Allow navigation and clipboard shortcuts, block other typing
  const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
  e.preventDefault();
});

// Initialize display as empty
setDisplay("");
