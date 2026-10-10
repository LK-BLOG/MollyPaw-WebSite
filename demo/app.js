/* MollyPaw - Frontend App Logic */
(function () {
  "use strict";

  // Configure marked
  if (typeof marked !== "undefined") {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  var API_BASE = "http://127.0.0.1:18765";

  // ---- i18n Translations ----
  var translations = {
    en: {
      new_chat: "New Chat",
      no_conversations: "No conversations yet",
      settings: "Settings",
      welcome_title: "Hello, I'm MollyPaw!",
      welcome_sub: "Your AI, right at your paw.",
      chip1: "Write a Python script",
      chip2: "Explain PyWebView",
      chip3: "What can you do?",
      input_placeholder: "Ask MollyPaw anything...",
      hint: "MollyPaw Beta 0.0.0.1.5",
      send: "Send",
      balance_label: "Balance: ",
      balance_unavailable: "Balance unavailable",
      cost_label: "Cost: ",
      thinking_depth: "Reasoning",
      thinking_none: "None",
      thinking_low: "Low",
      thinking_medium: "Medium",
      thinking_high: "High",
      thinking_max: "Max",
      approval_short_dangerous: "Approve for me",
      approval_short_all: "Ask for approval",
      approval_short_full: "Full access",
      msg_you: "You",
      msg_mollypaw: "MollyPaw",
      typing: "MollyPaw is thinking...",
      error_prefix: "Error: ",
      unknown_error: "Unknown error",
      tc_running: "Running...",
      tc_done: "Done",
      tc_error: "Failed",
      tc_rejected: "Rejected by user",
      danger_safe: "Safe",
      danger_moderate: "Moderate",
      danger_dangerous: "\u26A0\uFE0F Dangerous",
      settings_title: "Settings",
      provider_label: "Provider",
      protocol_label: "API Protocol",
      protocol_chat: "OpenAI Chat Completions",
      protocol_responses: "OpenAI Responses",
      fetch_models: "Fetch models",
      model_fetching: "Fetching models...",
      model_fetch_failed: "Model fetch failed",
      manual_model_placeholder: "Enter model ID manually",
      api_key_label: "API Key",
      base_url_label: "Base URL",
      model_label: "Model",
      temp_label: "Temperature",
      approval_mode_label: "Tool Approval Mode",
      approval_all: "Prompt for all tools",
      approval_dangerous: "Prompt dangerous only",
      approval_full: "Full access (no prompts)",
      save: "Save",
      cancel: "Cancel",
      saved: "Saved!",
      config_failed: "Failed to load config",
      approval_title: "Approval Required",
      approval_tool: "Tool",
      approval_args: "Arguments",
      approval_danger: "Danger Level",
      approval_approve: "Approve",
      approval_reject: "Reject",
      approval_always: "Always approve in this session",
      chip_prompt1: "Help me write a Python script to sort files by extension",
      chip_prompt2: "Explain how PyWebView works under the hood",
      chip_prompt3: "What can you do as an AI agent?",
      conv_unnamed: "Unnamed",
      conv_delete: "Delete",
    },
    zh: {
      new_chat: "\u65B0\u5EFA\u5BF9\u8BDD",
      no_conversations: "\u8FD8\u6CA1\u6709\u5BF9\u8BDD\u8BB0\u5F55",
      settings: "\u8BBE\u7F6E",
      welcome_title: "\u4F60\u597D\uFF0C\u6211\u662F MollyPaw\uFF01",
      welcome_sub: "\u4F60\u7684 AI\uFF0C\u5C31\u5728\u4F60\u7684\u722A\u5B50\u91CC\u3002",
      chip1: "\u5199\u4E00\u4E2A Python \u811A\u672C",
      chip2: "\u89E3\u91CA PyWebView \u5DE5\u4F5C\u539F\u7406",
      chip3: "\u4F60\u80FD\u505A\u4EC0\u4E48\uFF1F",
      input_placeholder: "\u95EE MollyPaw \u4EFB\u4F55\u95EE\u9898...",
      hint: "MollyPaw Beta 0.0.0.1.5",
      send: "发送",
      balance_label: "余额：",
      balance_unavailable: "余额暂不可用",
      cost_label: "本轮消耗：",
      thinking_depth: "思考深度",
      thinking_none: "无",
      thinking_low: "低",
      thinking_medium: "中",
      thinking_high: "高",
      thinking_max: "最高",
      approval_short_dangerous: "帮我批准",
      approval_short_all: "请求批准",
      approval_short_full: "完全访问",
      msg_you: "\u4F60",
      msg_mollypaw: "MollyPaw",
      typing: "MollyPaw \u6B63\u5728\u601D\u8003...",
      error_prefix: "\u9519\u8BEF\uFF1A",
      unknown_error: "\u672A\u77E5\u9519\u8BEF",
      tc_running: "\u6267\u884C\u4E2D...",
      tc_done: "\u5B8C\u6210",
      tc_error: "\u6267\u884C\u5931\u8D25",
      tc_rejected: "\u5DF2\u88AB\u7528\u6237\u62D2\u7EDD",
      danger_safe: "\u5B89\u5168",
      danger_moderate: "\u4E2D\u7B49",
      danger_dangerous: "\u26A0\uFE0F \u5371\u9669",
      settings_title: "\u8BBE\u7F6E",
      provider_label: "\u4F9B\u5E94\u5546",
      protocol_label: "API \u534F\u8BAE",
      protocol_chat: "OpenAI Chat Completions",
      protocol_responses: "OpenAI Responses",
      fetch_models: "\u62C9\u53D6\u6A21\u578B",
      model_fetching: "\u6B63\u5728\u62C9\u53D6\u6A21\u578B...",
      model_fetch_failed: "\u6A21\u578B\u62C9\u53D6\u5931\u8D25",
      manual_model_placeholder: "\u624B\u52A8\u8F93\u5165\u6A21\u578B ID",
      api_key_label: "API Key",
      base_url_label: "Base URL",
      model_label: "\u6A21\u578B",
      temp_label: "\u6E29\u5EA6",
      approval_mode_label: "\u5DE5\u5177\u5BA1\u6279\u6A21\u5F0F",
      approval_all: "\u6240\u6709\u5DE5\u5177\u90FD\u63D0\u793A",
      approval_dangerous: "\u4EC5\u5371\u9669\u5DE5\u5177\u63D0\u793A",
      approval_full: "\u5B8C\u5168\u8BBF\u95EE\uFF08\u65E0\u63D0\u793A\uFF09",
      save: "\u4FDD\u5B58",
      cancel: "\u53D6\u6D88",
      saved: "\u5DF2\u4FDD\u5B58\uFF01",
      config_failed: "\u52A0\u8F7D\u914D\u7F6E\u5931\u8D25",
      approval_title: "\u9700\u8981\u4F60\u7684\u6279\u51C6",
      approval_tool: "\u5DE5\u5177",
      approval_args: "\u53C2\u6570",
      approval_danger: "\u5371\u9669\u7B49\u7EA7",
      approval_approve: "\u6279\u51C6",
      approval_reject: "\u62D2\u7EDD",
      approval_always: "\u672C\u6B21\u4F1A\u8BDD\u59CB\u7EC8\u6279\u51C6",
      chip_prompt1: "\u5E2E\u6211\u5199\u4E00\u4E2A\u6309\u6269\u5C55\u540D\u6392\u5E8F\u6587\u4EF6\u7684 Python \u811A\u672C",
      chip_prompt2: "\u89E3\u91CA\u4E00\u4E0B PyWebView \u7684\u5DE5\u4F5C\u539F\u7406",
      chip_prompt3: "\u4F60\u80FD\u505A\u4EC0\u4E48\uFF1F",
      conv_unnamed: "\u672A\u547D\u540D\u5BF9\u8BDD",
      conv_delete: "\u5220\u9664",
    }
  };

  var currentLang = localStorage.getItem("mollypaw_lang") || "zh";
  var currentConvId = null;

  function t(key) {
    var lang = translations[currentLang] || translations.en;
    return lang[key] || translations.en[key] || key;
  }

  function dangerLabel(level) {
    if (level === "safe") return t("danger_safe");
    if (level === "moderate") return t("danger_moderate");
    if (level === "dangerous") return t("danger_dangerous");
    return level;
  }

  // ---- Apply translations to all [data-i18n] elements ----
  function applyTranslations() {
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute("data-i18n");
      var text = t(key);
      var attrTarget = el.getAttribute("data-i18n-attr");
      if (attrTarget) {
        el.setAttribute(attrTarget, text);
      } else {
        el.textContent = text;
      }
    }
    // Update prompt chip translated prompts
    var chips = document.querySelectorAll(".prompt-chip[data-i18n-prompt]");
    for (var j = 0; j < chips.length; j++) {
      var pKey = chips[j].getAttribute("data-i18n-prompt");
      if (pKey) chips[j].setAttribute("data-prompt", t(pKey));
    }
    // Update lang toggle label
    var langToggle = document.getElementById("lang-toggle");
    if (langToggle) {
      langToggle.textContent = currentLang === "zh" ? "EN" : "CN";
      langToggle.title = currentLang === "zh" ? "Switch to English" : "\u5207\u6362\u4E3A\u4E2D\u6587";
    }
  }

  // ---- DOM References (null-safe) ----
  function $(id) { return document.getElementById(id); }

  var messagesEl     = $("messages");
  var welcomeEl      = $("welcome-screen");
  var userInput      = $("user-input");
  var sendBtn        = $("send-btn");
  var chatHistory    = $("chat-history");
  var isLoading = false;

  var approvalBtn    = $("approval-btn");
  var approvalLabelEl = $("approval-label");
  var approvalMenu   = $("approval-menu");
  var modelMenuBtn   = $("model-menu-btn");
  var thinkingMenu   = $("thinking-menu");
  var thinkingSlider = $("thinking-slider");
  var thinkingCurrent = $("thinking-current");
  var thinkingModel  = $("thinking-model");
  var thinkingThumb  = $("thinking-thumb");
  var balanceStatus  = $("balance-status");
  var thinkingLevels = ["none", "low", "medium", "high", "max"];
  var approvalModes  = ["prompt_dangerous", "prompt_all", "full_access"];

  function approvalLabel(mode) {
    if (mode === "prompt_all") return t("approval_short_all");
    if (mode === "full_access") return t("approval_short_full");
    return t("approval_short_dangerous");
  }

  function setApprovalMode(mode) {
    if (approvalModes.indexOf(mode) < 0) mode = "prompt_dangerous";
    if (approvalBtn) {
      approvalBtn.dataset.mode = mode;
      approvalLabelEl.textContent = approvalLabel(mode);
    }
    document.querySelectorAll("[data-approval-mode]").forEach(function (option) {
      option.classList.toggle("active", option.dataset.approvalMode === mode);
    });
    document.querySelectorAll("[data-mode-icon]").forEach(function (icon) {
      icon.classList.toggle("active", icon.dataset.modeIcon === mode);
    });
  }

  var thinkingFrame = 0;

  function updateThinkingThumb(index) {
    if (!thinkingThumb) return;
    var last = Math.max(1, thinkingLevels.length - 1);
    var progress = Math.max(0, Math.min(index, last)) / last;
    var offset = (1 - progress * 2) * 15;
    thinkingThumb.style.left = "calc(" + (progress * 100).toFixed(3) + "% + " + offset.toFixed(2) + "px)";
    var wrap = thinkingSlider ? thinkingSlider.closest(".thinking-slider-wrap") : null;
    if (wrap) {
      wrap.style.setProperty("--slider-progress", (progress * 100).toFixed(3) + "%");
      wrap.classList.toggle("is-max", index === last);
    }
  }

  function previewThinkingLevel(level) {
    if (thinkingFrame) cancelAnimationFrame(thinkingFrame);
    thinkingFrame = requestAnimationFrame(function () {
      thinkingFrame = 0;
      var index = thinkingLevels.indexOf(level);
      if (index < 0) { level = "none"; index = 0; }
      updateThinkingThumb(index);
      if (thinkingCurrent) thinkingCurrent.textContent = t("thinking_" + level);
      document.querySelectorAll(".thinking-dots span").forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex <= index);
      });
      if (thinkingModel) thinkingModel.textContent = formatModelName(modelMenuBtn ? modelMenuBtn.dataset.model : "");
    });
  }

  function setThinkingLevel(level, persist) {
    var index = thinkingLevels.indexOf(level);
    if (index < 0) { level = "none"; index = 0; }
    localStorage.setItem("mollypaw_thinking", level);
    if (thinkingSlider && Number(thinkingSlider.value) !== index) thinkingSlider.value = String(index);
    updateThinkingThumb(index);
    if (thinkingCurrent) thinkingCurrent.textContent = t("thinking_" + level);
    document.querySelectorAll(".thinking-dots span").forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex <= index);
    });
    updateModelButton();
    if (persist) postAPI("/api/thinking_level", { level: level });
  }

  function formatModelName(model) {
    if (!model) return t("model_label");
    var names = { deepseek: "DeepSeek", openai: "OpenAI", gpt: "GPT", qwen: "Qwen", glm: "GLM", kimi: "Kimi", grok: "Grok", llm: "LLM" };
    return String(model).split("/").pop().split(/[-_\s]+/).filter(Boolean).map(function (part) {
      var lower = part.toLowerCase();
      if (names[lower]) return names[lower];
      if (/^v\d/i.test(part)) return part.charAt(0).toUpperCase() + part.slice(1);
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(" ");
  }

  function setContextWindowInput(tokens) {
    var input = $("cfg-context-window");
    var unit = $("cfg-context-unit");
    if (!input || !unit) return;
    var value = Number(tokens);
    if (!Number.isFinite(value) || value <= 0) value = 200000;
    if (value >= 1000000) {
      input.value = String(value / 1000000);
      unit.value = "M";
    } else {
      input.value = String(value / 1000);
      unit.value = "K";
    }
  }

  function readContextWindowInput() {
    var input = $("cfg-context-window");
    var unit = $("cfg-context-unit");
    var amount = input ? Number(input.value) : NaN;
    if (!Number.isFinite(amount) || amount <= 0) return null;
    var multiplier = unit && unit.value === "M" ? 1000000 : 1000;
    return Math.round(amount * multiplier);
  }

  function updateModelButton() {
    if (!modelMenuBtn) return;
    var model = formatModelName(modelMenuBtn.dataset.model);
    var level = localStorage.getItem("mollypaw_thinking") || "none";
    modelMenuBtn.textContent = model + "  " + t("thinking_" + level);
    if (thinkingModel) thinkingModel.textContent = model;
  }

  // ---- Helpers ----
  function scrollToBottom() {
    var c = $("chat-container");
    if (c) c.scrollTop = c.scrollHeight;
  }

  function hideWelcome() {
    if (welcomeEl) welcomeEl.style.display = "none";
    if (messagesEl) messagesEl.classList.add("has-messages");
  }

  function showWelcome() {
    if (welcomeEl) welcomeEl.style.display = "";
    if (messagesEl) {
      messagesEl.innerHTML = "";
      messagesEl.classList.remove("has-messages");
    }
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function postAPI(path, body) {
    return fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) { return r.json(); });
  }

  function getAPI(path) {
    return fetch(API_BASE + path).then(function (r) { return r.json(); });
  }

  function pollEvents() {
    getAPI("/api/events").then(function (result) {
      (result.events || []).forEach(function (event) {
        if (typeof window[event.name] === "function") window[event.name](event.payload);
      });
    }).catch(function () {}).finally(function () {
      setTimeout(pollEvents, 250);
    });
  }

  // ---- Sidebar: Conversation List ----
  function loadConversations() {
    getAPI("/api/conversations");
  }

  function renderConversationList(convs) {
    if (!chatHistory) return;
    chatHistory.innerHTML = "";
    if (!convs || convs.length === 0) {
      var empty = document.createElement("div");
      empty.className = "history-empty";
      empty.setAttribute("data-i18n", "no_conversations");
      empty.textContent = t("no_conversations");
      chatHistory.appendChild(empty);
      return;
    }
    for (var i = 0; i < convs.length; i++) {
      var conv = convs[i];
      var item = document.createElement("div");
      item.className = "history-item" + (conv.id === currentConvId ? " active" : "");
      item.setAttribute("data-conv-id", conv.id);

      var titleSpan = document.createElement("span");
      titleSpan.className = "history-item-title";
      titleSpan.textContent = conv.title || t("conv_unnamed");
      item.appendChild(titleSpan);

      var delBtn = document.createElement("button");
      delBtn.className = "history-item-delete";
      delBtn.textContent = "\u00D7";
      delBtn.title = t("conv_delete");
      delBtn.setAttribute("data-conv-id", conv.id);
      delBtn.addEventListener("click", (function (id) {
        return function (e) {
          e.stopPropagation();
          if (confirm(t("conv_delete") + "?")) {
            postAPI("/api/conversations/delete", { id: id });
            if (currentConvId === id) {
              currentConvId = null;
              showWelcome();
            }
          }
        };
      })(conv.id));
      item.appendChild(delBtn);

      item.addEventListener("click", (function (id) {
        return function () {
          postAPI("/api/conversations/load", { id: id });
        };
      })(conv.id));

      chatHistory.appendChild(item);
    }
  }

  function highlightActiveConv() {
    var items = document.querySelectorAll(".history-item");
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute("data-conv-id") === currentConvId) {
        items[i].classList.add("active");
      } else {
        items[i].classList.remove("active");
      }
    }
  }

  // ---- Tool Call Indicators ----
  var pendingApprove = null;

  function showToolCall(info) {
    hideWelcome();
    var div = document.createElement("div");
    div.className = "tool-call-indicator";
    div.id = "tool-call-" + info.request_id;

    var argsStr = "";
    try { argsStr = JSON.stringify(info.args, null, 2); } catch(e) { argsStr = String(info.args); }
    if (argsStr.length > 200) argsStr = argsStr.substring(0, 200) + "...";

    div.innerHTML = '<div class="tc-header">' +
      '<span class="tc-icon">\uD83D\uDD27</span>' +
      '<span class="tc-name">' + escapeHtml(info.name) + '</span>' +
      '<span class="tc-danger tc-danger-' + info.danger_level + '">' + dangerLabel(info.danger_level) + '</span>' +
      '</div>' +
      '<pre class="tc-args">' + escapeHtml(argsStr) + '</pre>' +
      '<div class="tc-status tc-running">' + t("tc_running") + '</div>';

    div.addEventListener("click", function() {
      div.classList.toggle("expanded");
    });

    if (messagesEl) messagesEl.appendChild(div);
    scrollToBottom();
  }

  function updateToolResult(requestId, result, success) {
    var el = document.getElementById("tool-call-" + requestId);
    if (!el) return;
    var status = el.querySelector(".tc-status");
    if (status) {
      status.className = "tc-status " + (success ? "tc-done" : "tc-error");
      status.textContent = success ? "\u2705 " + t("tc_done") : "\u274C " + (result || t("tc_error"));
    }
  }

  function showToolRejected(requestId) {
    var el = document.getElementById("tool-call-" + requestId);
    if (!el) return;
    var status = el.querySelector(".tc-status");
    if (status) {
      status.className = "tc-status tc-rejected";
      status.textContent = "\u274C " + t("tc_rejected");
    }
  }

  // ---- Approval Modal ----
  function showApprovalModal(info) {
    var overlay = $("approval-overlay");
    if (!overlay) return Promise.resolve(false);
    var tn = $("approval-tool-name");
    if (tn) tn.textContent = info.name;

    var argsStr = "";
    try { argsStr = JSON.stringify(info.args, null, 2); } catch(e) { argsStr = String(info.args); }
    var aa = $("approval-args");
    if (aa) aa.textContent = argsStr;

    var dangerEl = $("approval-danger");
    if (dangerEl) {
      dangerEl.textContent = dangerLabel(info.danger_level);
      dangerEl.className = "danger-badge danger-" + info.danger_level;
    }

    overlay.style.display = "flex";
    var ac = $("approval-always-check");
    if (ac) ac.checked = false;

    return new Promise(function(resolve) {
      pendingApprove = { resolve: resolve, requestId: info.request_id };
    });
  }

  function hideApprovalModal() {
    var overlay = $("approval-overlay");
    if (overlay) overlay.style.display = "none";
  }

  // Approval buttons (null-safe)
  var approveBtn = $("approval-approve");
  if (approveBtn) {
    approveBtn.addEventListener("click", function() {
      var always = $("approval-always-check");
      if (always && always.checked) {
        postAPI("/api/approval_mode", { mode: "full_access" });
      }
      if (pendingApprove) {
        postAPI("/api/approve_tool", { request_id: pendingApprove.requestId, approved: true });
        pendingApprove.resolve(true);
        pendingApprove = null;
      }
      hideApprovalModal();
    });
  }

  var rejectBtn = $("approval-reject");
  if (rejectBtn) {
    rejectBtn.addEventListener("click", function() {
      if (pendingApprove) {
        postAPI("/api/approve_tool", { request_id: pendingApprove.requestId, approved: false });
        pendingApprove.resolve(false);
        pendingApprove = null;
      }
      hideApprovalModal();
    });
  }

  // ---- Python Callbacks ----
  window._onBalanceResult = function (result) {
    var el = $("balance-status");
    if (!el) return;
    if (result.ok && result.supported) {
      var values = result.balances && result.balances.length ? result.balances.slice() : [{ currency: result.currency, balance: result.balance }];
      var priority = { CNY: 0, USD: 1 };
      values.sort(function (a, b) {
        return (priority[a.currency] == null ? 99 : priority[a.currency]) - (priority[b.currency] == null ? 99 : priority[b.currency]);
      });
      el.textContent = t("balance_label") + values.map(function (item) {
        return (item.currency ? item.currency + " " : "") + item.balance;
      }).join(" / ");
    } else {
      el.textContent = result.error || t("balance_unavailable");
    }
  };

  window._onToolCall = function(info) {
    showToolCall(info);
  };

  window._onToolResult = function(info) {
    if (info.rejected) {
      showToolRejected(info.request_id);
    } else {
      var truncated = info.result || "";
      if (truncated.length > 100) truncated = truncated.substring(0, 100) + "...";
      updateToolResult(info.request_id, truncated, info.success);
    }
  };

  window._onApprovalRequest = function(info) {
    showApprovalModal(info);
  };

  // Conversation callbacks
  window._onConversationsResult = function(result) {
    if (result.ok) {
      renderConversationList(result.conversations);
    }
  };

  window._onNewConversationResult = function(result) {
    if (result.ok) {
      currentConvId = result.id;
      showWelcome();
      highlightActiveConv();
    }
  };

  window._onLoadConversationResult = function(result) {
    if (result.ok && result.conversation) {
      currentConvId = result.conversation.id;
      highlightActiveConv();
      // Render messages
      if (messagesEl) messagesEl.innerHTML = "";
      hideWelcome();
      var msgs = result.conversation.messages || [];
      for (var i = 0; i < msgs.length; i++) {
        var m = msgs[i];
        if (m.role === "system") continue;
        if (m.role === "user") {
          appendMessage("user", m.content);
        } else if (m.role === "assistant" && m.content) {
          appendMessage("assistant", m.content);
        }
      }
    }
  };

  // ---- Message Rendering ----
  function appendMessage(role, text, meta) {
    hideWelcome();
    var div = document.createElement("div");
    div.className = "message " + role;
    var label = document.createElement("div");
    label.className = "msg-label";
    label.textContent = role === "user" ? t("msg_you") : t("msg_mollypaw");
    div.appendChild(label);
    var body = document.createElement("div");
    body.className = "msg-body";
    if (role === "assistant" && typeof marked !== "undefined") {
      body.innerHTML = marked.parse(text || "");
    } else {
      body.textContent = text;
    }
    div.appendChild(body);
    if (role === "assistant" && meta && meta.cost !== null && meta.cost !== undefined && !isNaN(Number(meta.cost))) { var cost = document.createElement("div"); cost.className = "msg-cost"; cost.textContent = t("cost_label") + meta.cost; div.appendChild(cost); }
    if (messagesEl) messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function showTyping() {
    hideWelcome();
    var div = document.createElement("div");
    div.className = "typing-indicator";
    div.id = "typing";
    div.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span> ' + t("typing");
    if (messagesEl) messagesEl.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById("typing");
    if (el) el.remove();
  }

  // ---- Send Message ----
  function sendMessage() {
    var text = userInput.value.trim();
    if (!text || isLoading) return;

    appendMessage("user", text);
    userInput.value = "";
    autoResize();
    sendBtn.disabled = true;
    isLoading = true;
    showTyping();

    window._onChatResult = function (result) {
      hideTyping();
      if (result.ok) {
        appendMessage("assistant", result.response, result);
      } else {
        appendMessage("error", t("error_prefix") + (result.error || t("unknown_error")));
      }
      isLoading = false;
      /* focus disabled in demo */;
      window._onChatResult = null;
      // Refresh sidebar after chat
      loadConversations();
    };

    postAPI("/api/chat", { message: text, thinking_level: localStorage.getItem("mollypaw_thinking") || "none" });
  }

  // ---- Auto-resize Textarea ----
  function autoResize() {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
  }

  // ---- Settings ----
  var providers = [];
  var selectedProvider = null;

  function renderModels(models) {
    var select = $("cfg-model");
    if (!select) return;
    select.innerHTML = "";
    (models || []).forEach(function (id) {
      var option = document.createElement("option");
      option.value = id;
      option.textContent = formatModelName(id);
      select.appendChild(option);
    });
    select.disabled = !(models && models.length);
  }

  function updateProviderFields() {
    var id = $("cfg-provider").value;
    selectedProvider = providers.filter(function (p) { return p.id === id; })[0];
    var custom = id === "custom";
    $("cfg-custom-url-group").style.display = custom ? "" : "none";
    $("cfg-protocol-group").style.display = custom ? "" : "none";
    $("cfg-balance-path-group").style.display = custom ? "" : "none";
    var tempGroup = $("cfg-temperature").closest(".form-group");
    if (tempGroup) tempGroup.style.display = selectedProvider && !selectedProvider.supports_temperature ? "none" : "";
    if (custom) $("cfg-protocol").value = "chat";
    renderModels([]);
    $("cfg-manual-model").style.display = "none";
  }

  function loadProviders(done) {
    getAPI("/api/providers").then(function (result) {
      providers = result.providers || [];
      var select = $("cfg-provider");
      if (select) {
        select.innerHTML = "";
        providers.forEach(function (provider) {
          var option = document.createElement("option");
          option.value = provider.id;
          option.textContent = provider.display_name;
          select.appendChild(option);
        });
      }
      if (done) done();
    });
  }

  function applyConfig(cfg) {
    if (modelMenuBtn) modelMenuBtn.dataset.model = cfg.model || "";
    setThinkingLevel(cfg.thinking_level || localStorage.getItem("mollypaw_thinking") || "none", false);
    setApprovalMode(cfg.approval_mode || "prompt_dangerous");
    var ak = $("cfg-api-key");
    if (ak) {
      ak.type = "password";
      ak.dataset.original = cfg.api_key_set ? cfg.api_key : "";
      ak.dataset.hasKey = cfg.api_key_set ? "true" : "false";
      ak.value = cfg.api_key_set ? cfg.api_key : "";
      ak.placeholder = "sk-...";
      ak.onfocus = function () {
        if (ak.dataset.hasKey === "true" && ak.value === ak.dataset.original) ak.select();
      };
    }
    loadProviders(function () {
      var ps = $("cfg-provider");
      if (ps) ps.value = cfg.provider_id || "custom";
      updateProviderFields();
      if (selectedProvider && selectedProvider.id !== "custom") {
        renderModels(cfg.model ? [cfg.model] : []);
      }
      if ($("cfg-base-url")) $("cfg-base-url").value = cfg.base_url || "";
      if ($("cfg-balance-path")) $("cfg-balance-path").value = cfg.balance_path || "";
      if ($("cfg-protocol")) $("cfg-protocol").value = cfg.protocol || "chat";
      if ($("cfg-temperature")) $("cfg-temperature").value = cfg.temperature != null ? cfg.temperature : 0.7;
      if ($("cfg-max-tokens")) $("cfg-max-tokens").value = cfg.max_tokens || 32768;
      if ($("cfg-max-tool-rounds")) $("cfg-max-tool-rounds").value = cfg.max_tool_rounds || 100;
      setContextWindowInput(cfg.context_window || cfg.context_window_resolved || 200000);
      if ($("cfg-approval-mode") && cfg.approval_mode) $("cfg-approval-mode").value = cfg.approval_mode;
    });
  }

  window._onConfigResult = function (result) {
    if (!result.ok) {
      var cs = $("cfg-status");
      if (cs) { cs.textContent = t("config_failed"); cs.className = "cfg-status err"; }
      return;
    }
    applyConfig(result.config || {});
  };

  var currentSleepSettings = { mode: "off", tasks: ["memory", "review", "dream"], max_llm_calls: 100 };

  function setSleepStatus(text, isError) {
    var el = $("sleep-status-text");
    if (!el) return;
    el.textContent = text || "";
    el.className = isError ? "sleep-status err" : "sleep-status ok";
  }

  function applySleepSettings(settings) {
    currentSleepSettings = Object.assign({}, currentSleepSettings, settings || {});
    var mode = $("cfg-sleep-mode");
    if (mode) mode.value = currentSleepSettings.mode || "off";
    var maxCalls = $("cfg-sleep-max-calls");
    if (maxCalls) maxCalls.value = currentSleepSettings.max_llm_calls != null ? currentSleepSettings.max_llm_calls : 100;
    var selected = currentSleepSettings.tasks || [];
    document.querySelectorAll("#sleep-task-group input").forEach(function (input) {
      input.checked = selected.indexOf(input.value) >= 0;
    });
    var enabled = currentSleepSettings.mode === "full";
    document.querySelectorAll("#sleep-task-group input").forEach(function (input) { input.disabled = !enabled; });
    var group = $("sleep-task-group");
    if (group) group.classList.toggle("disabled", !enabled);
  }

  function loadSleepSettings() {
    getAPI("/api/sleep").then(function (result) {
      if (result.ok) applySleepSettings(result.sleep || {});
      else setSleepStatus(result.error || "读取失败", true);
    }).catch(function (err) { setSleepStatus(String(err), true); });
  }

  function saveSleepSettings() {
    var settings = Object.assign({}, currentSleepSettings);
    var mode = $("cfg-sleep-mode");
    if (mode) settings.mode = mode.value;
    var maxCalls = $("cfg-sleep-max-calls");
    if (maxCalls && maxCalls.value !== "") settings.max_llm_calls = Math.max(1, Math.min(500, parseInt(maxCalls.value, 10) || 100));
    settings.tasks = [];
    document.querySelectorAll("#sleep-task-group input").forEach(function (input) {
      if (input.checked) settings.tasks.push(input.value);
    });
    currentSleepSettings = settings;
    var enabled = settings.mode === "full";
    document.querySelectorAll("#sleep-task-group input").forEach(function (input) { input.disabled = !enabled; });
    var group = $("sleep-task-group");
    if (group) group.classList.toggle("disabled", !enabled);

    function done(result) {
      if (result.ok) {
        currentSleepSettings = Object.assign({}, currentSleepSettings, result.sleep || {});
        setSleepStatus("已生效");
      } else {
        setSleepStatus(result.error || "保存失败", true);
      }
    }
    postAPI("/api/sleep", settings).then(done).catch(function (err) {
      setSleepStatus(String(err), true);
    });
  }

  function showSettingsTab(name) {
    document.querySelectorAll("[data-settings-tab]").forEach(function (button) {
      button.classList.toggle("active", button.dataset.settingsTab === name);
    });
    document.querySelectorAll("[data-settings-panel]").forEach(function (panel) {
      panel.classList.toggle("active", panel.dataset.settingsPanel === name);
    });
  }

  function openSettings() {
    var sm = $("settings-modal");
    if (!sm) return;
    sm.style.display = "flex";
    var cs = $("cfg-status");
    if (cs) { cs.textContent = ""; cs.className = "cfg-status"; }
    showSettingsTab("model");
    getAPI("/api/config");
    loadSleepSettings();
  }
  function fetchModels() {
    var providerId = $("cfg-provider").value;
    var keyInput = $("cfg-api-key");
    var key = keyInput ? keyInput.value.trim() : "";
    var button = $("cfg-fetch-models");
    var status = $("cfg-status");
    if (button) { button.disabled = true; button.textContent = t("model_fetching"); }
    postAPI("/api/models", { provider_id: providerId, api_key: key, base_url: $("cfg-base-url").value, protocol: $("cfg-protocol").value })
      .then(function () { /* result arrives through HTTP event polling */ });
    window._onModelsResult = function (result) {
      if (button) { button.disabled = false; button.textContent = t("fetch_models"); }
      if (result.ok) {
        renderModels(result.models);
        $("cfg-manual-model").style.display = "none";
        if (status) { status.textContent = (result.models || []).length + " models"; status.className = "cfg-status ok"; }
      } else {
        renderModels([]);
        $("cfg-manual-model").style.display = "";
        $("cfg-manual-model").placeholder = t("manual_model_placeholder");
        if (status) { status.textContent = t("model_fetch_failed") + ": " + (result.error || ""); status.className = "cfg-status err"; }
      }
      window._onModelsResult = null;
    };
  }

  function saveSettings() {
    var modelSelect = $("cfg-model");
    var manual = $("cfg-manual-model");
    var cfg = { provider_id: $("cfg-provider").value, model: (manual && manual.style.display !== "none" ? manual.value : modelSelect.value), protocol: $("cfg-protocol").value };
    var ak = $("cfg-api-key");
    if (ak && ak.value && ak.value !== ak.dataset.original && ak.value.indexOf("...") < 0) cfg.api_key = ak.value.trim();
    if (cfg.provider_id === "custom") {
      cfg.base_url = $("cfg-base-url").value;
      cfg.balance_path = $("cfg-balance-path").value;
    }
    var te = $("cfg-temperature");
    if (te && te.value !== "") cfg.temperature = parseFloat(te.value);
    var mt = $("cfg-max-tokens");
    if (mt && mt.value !== "") cfg.max_tokens = Math.max(256, parseInt(mt.value, 10) || 32768);
    var mr = $("cfg-max-tool-rounds");
    if (mr && mr.value !== "") cfg.max_tool_rounds = Math.max(1, Math.min(1000, parseInt(mr.value, 10) || 100));
    var cw = $("cfg-context-window");
    if (cw && cw.value !== "") {
      var parsedContext = readContextWindowInput();
      if (parsedContext == null) {
        $("cfg-status").textContent = "上下文窗口必须大于 0";
        return;
      }
      cfg.context_window = parsedContext;
    }
    var am = $("cfg-approval-mode");
    if (am && am.value) cfg.approval_mode = am.value;
    if (!cfg.model) { $("cfg-status").textContent = t("model_fetch_failed"); return; }
    postAPI("/api/config", cfg);
  }

  window._onSaveConfigResult = function (result) {
    var cs = $("cfg-status");
    if (cs) { cs.textContent = result.ok ? t("saved") : t("error_prefix") + (result.error || ""); cs.className = result.ok ? "cfg-status ok" : "cfg-status err"; }
    if (result.ok) {
      setTimeout(function () { $("settings-modal").style.display = "none"; }, 800);
      getAPI("/api/config");
      getAPI("/api/balance");
    }
  };

  pollEvents();

  // ---- Language Toggle ----
  var langBtn = $("lang-toggle");
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      currentLang = currentLang === "zh" ? "en" : "zh";
      localStorage.setItem("mollypaw_lang", currentLang);
      applyTranslations();
      setThinkingLevel(localStorage.getItem("mollypaw_thinking") || "none", false);
      setApprovalMode(approvalBtn ? approvalBtn.dataset.mode : "prompt_dangerous");
      // Re-render sidebar with new language
      loadConversations();
    });
  }

  // ---- Prompt Chips ----
  var chips = document.querySelectorAll(".prompt-chip");
  for (var ci = 0; ci < chips.length; ci++) {
    chips[ci].addEventListener("click", function () {
      userInput.value = this.getAttribute("data-prompt");
      autoResize();
      /* focus disabled in demo */;
      sendBtn.disabled = false;
    });
  }

  // ---- Event Listeners ----
  if (userInput) {
    userInput.addEventListener("input", function () {
      sendBtn.disabled = !userInput.value.trim();
      autoResize();
    });

    userInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (modelMenuBtn && thinkingMenu) {
    modelMenuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (approvalMenu) approvalMenu.hidden = true;
      var open = thinkingMenu.hidden;
      thinkingMenu.hidden = !open;
      thinkingMenu.style.display = open ? "block" : "none";
      modelMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    if (thinkingSlider) {
      thinkingSlider.addEventListener("input", function (e) {
        e.stopPropagation();
        previewThinkingLevel(thinkingLevels[Number(thinkingSlider.value)] || "none");
      });
      thinkingSlider.addEventListener("change", function () {
        setThinkingLevel(thinkingLevels[Number(thinkingSlider.value)] || "none", true);
      });
      thinkingSlider.addEventListener("click", function (e) { e.stopPropagation(); });
    }
  }

  if (approvalBtn && approvalMenu) {
    approvalBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (thinkingMenu) thinkingMenu.hidden = true;
      approvalMenu.hidden = !approvalMenu.hidden;
    });
    document.querySelectorAll("[data-approval-mode]").forEach(function (option) {
      option.addEventListener("click", function (e) {
        e.stopPropagation();
        var mode = option.dataset.approvalMode;
        setApprovalMode(mode);
        postAPI("/api/approval_mode", { mode: mode });
        approvalMenu.hidden = true;
      });
    });
  }

  document.addEventListener("click", function (e) {
    var target = e.target;
    if (target && target.closest && (target.closest("#model-menu-btn") || target.closest("#thinking-menu") || target.closest("#approval-btn") || target.closest("#approval-menu"))) return;
    if (thinkingMenu) { thinkingMenu.hidden = true; thinkingMenu.style.display = "none"; }
    if (approvalMenu) approvalMenu.hidden = true;
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (thinkingMenu) thinkingMenu.hidden = true;
      if (approvalMenu) approvalMenu.hidden = true;
    }
  });

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);

  // ---- New Chat Button ----
  var newChatBtn = $("new-chat-btn");
  if (newChatBtn) {
    newChatBtn.addEventListener("click", function () {
      currentConvId = null;
      postAPI("/api/conversations/new");
      showWelcome();
    });
  }

  // ---- Settings Button ----
  var settingsBtn = $("settings-btn");
  if (settingsBtn) settingsBtn.addEventListener("click", openSettings);

  var settingsClose = $("settings-close");
  if (settingsClose) {
    settingsClose.addEventListener("click", function () {
      var sm = $("settings-modal");
      if (sm) sm.style.display = "none";
    });
  }

  var cfgSave = $("cfg-save");
  if (cfgSave) cfgSave.addEventListener("click", saveSettings);
  var cfgFetch = $("cfg-fetch-models");
  if (cfgFetch) cfgFetch.addEventListener("click", fetchModels);
  var cfgProvider = $("cfg-provider");
  if (cfgProvider) cfgProvider.addEventListener("change", updateProviderFields);

  var sleepMode = $("cfg-sleep-mode");
  if (sleepMode) sleepMode.addEventListener("change", saveSleepSettings);
  var sleepMaxCalls = $("cfg-sleep-max-calls");
  if (sleepMaxCalls) sleepMaxCalls.addEventListener("change", saveSleepSettings);
  document.querySelectorAll("#sleep-task-group input").forEach(function (input) {
    input.addEventListener("change", saveSleepSettings);
  });

  var cfgCancel = $("cfg-cancel");
  if (cfgCancel) {
    cfgCancel.addEventListener("click", function () {
      var sm = $("settings-modal");
      if (sm) sm.style.display = "none";
    });
  }

  document.querySelectorAll("[data-settings-tab]").forEach(function (button) {
    button.addEventListener("click", function () { showSettingsTab(button.dataset.settingsTab); });
  });

  var settingsModal = $("settings-modal");
  if (settingsModal) {
    settingsModal.addEventListener("click", function (e) {
      if (e.target === settingsModal) settingsModal.style.display = "none";
    });
  }

  // ---- Activity Wakeup ----
  var lastActivityPing = 0;
  function pingActivity() {
    var now = Date.now();
    if (now - lastActivityPing < 5000) return;
    lastActivityPing = now;
    postAPI("/api/activity", {});
  }
  document.addEventListener("pointerdown", pingActivity, true);
  document.addEventListener("keydown", pingActivity, true);

  // ---- Init ----
  applyTranslations();
  setThinkingLevel(localStorage.getItem("mollypaw_thinking") || "none", false);
  getAPI("/api/config");
  getAPI("/api/balance");
  loadConversations();
  if (userInput) /* focus disabled in demo */;
  // Intercept markdown links to open in system browser
  document.addEventListener("click", function(e) {
    var link = e.target.closest('.msg-body a');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      e.preventDefault();
      window.open(href, "_blank", "noopener");
    }
  }, true);

})();
