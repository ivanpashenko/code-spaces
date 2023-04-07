//code+window-0,20547px,17307px
const boardContainer = document.getElementById("boardContainer");

//code+window-1,20556px,17155px
const board = document.getElementById("board");

//code+window-2,18997.8px,20830.5px
const zoomInButton = document.getElementById("zoomIn");

//code+window-3,18975.8px,20666.5px
const zoomOutButton = document.getElementById("zoomOut");

//code+window-4,20521px,17928px
const boardWidth = 50000; // Set the board width

//code+window-5,20510px,17760px
const boardHeight = 40000; // Set the board height

//code+window-6,20530px,17455px
board.style.width = `${boardWidth}px`;

//code+window-7,20513px,17586px
board.style.height = `${boardHeight}px`;

//code+window-8,28415px,20081px
let parsedBlocks = []

//code+window-9,27639px,17833px
let owner, repo, filePath, branch, token;

//code+window-10,23757.3px,21841.7px
let windowCounter = 0; // Add a window counter to assign unique IDs

//code+window-11,20607px,15685px
boardContainer.scrollLeft = (boardWidth - boardContainer.clientWidth) / 2;

//code+window-12,20568px,16048px
boardContainer.scrollTop = (boardHeight - boardContainer.clientHeight) / 2;

//code+window-13,22165.2px,23234.9px
let offsetX = 0;

//code+window-14,22164px,23319.8px
let offsetY = 0;

//code+window-15,23758px,21950px
let activeWindows = [];

//code+window-16,22148.3px,23498.3px
function createDraggableWindows(codePieces, useParsedBlocks = false) {
  console.log("Creating draggable windows with:", codePieces, useParsedBlocks);
  const horizontalSpacing = 20;

  const functionNameRegex = fileExtension === 'js'
    ? /(?:(?:const|let|var)\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+\.\w+|\w+(?:\.\w+)*\s*=\s*function)|function\s+([a-zA-Z0-9_]+))/
    : /(?:(?:tw-)?def[\w-]*)\s+([a-zA-Z0-9_]+)/;
  //const functionNameRegex = /(?:(?:tw-)?def[\w-]*)\s+([a-zA-Z0-9_]+)/;

  codePieces.forEach((piece, index) => {
    const windowEl = document.createElement("div");
    windowEl.classList.add("window");

    if (useParsedBlocks) {
      windowEl.id = `window-${piece.id}`;
      windowEl.style.left = `${piece.x}px`;
      windowEl.style.top = `${piece.y}px`;
      windowEl.style.userSelect = "none";
      piece = piece.code;
    } else {
      windowEl.id = `window-${windowCounter++}`;
      const startX = boardWidth / 2 - (codePieces.length * horizontalSpacing) / 2;
      const startY = boardHeight / 2;
      windowEl.style.left = `${startX + horizontalSpacing * index}px`;
      windowEl.style.top = `${startY}px`;
    }

    // Extract function name and add it as a title
    const match = piece.match(functionNameRegex);
    if (match) {
      const titleEl = document.createElement("div");
      titleEl.classList.add("window-title");
      titleEl.style.transformOrigin = 'bottom left';
      titleEl.textContent = match[1] || match[2] || match[3]; // Choose the first matched group
      windowEl.appendChild(titleEl);
    }

    const codeEl = document.createElement("pre");
    codeEl.textContent = piece;
    windowEl.appendChild(codeEl);

    windowEl.style.position = "absolute";
    windowEl.addEventListener("mousedown", startDrag);
    windowEl.addEventListener('dblclick', handleDoubleClick);
    board.appendChild(windowEl);

  });

  document.addEventListener("mouseup", endDrag);

}

function handleDoubleClick(e) {
  // Get the target code window
  const codeWindow = e.currentTarget;

  // Get the code block element inside the code window
  const codeBlock = codeWindow.querySelector('pre');

  // Make the code block content editable
  codeBlock.contentEditable = "true";
  codeBlock.focus();

  // Add event listeners to handle when the editing is done
  codeBlock.addEventListener('blur', finishEditing);
  codeBlock.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      codeBlock.blur();
    }
  });
}

function finishEditing(e) {
  const codeBlock = e.currentTarget;

  // Disable contentEditable
  codeBlock.contentEditable = "false";

  // Remove the event listeners
  codeBlock.removeEventListener('blur', finishEditing);
  codeBlock.removeEventListener('keydown', handleKeyDown);

  // Update the code in the code block
  // You may need to perform additional actions here,
  // such as saving the updated code or updating related data structures
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    const codeBlock = e.currentTarget;
    codeBlock.blur();
  }
}

//code+window-17,24952.4px,23238.5px
const selectionBox = document.createElement("div");

//code+window-18,24955.4px,23413.5px
selectionBox.style.position = "absolute";

//code+window-19,24926.4px,23868.5px
selectionBox.style.border = "1px dashed gray";

//code+window-20,24953.4px,23654.5px
selectionBox.style.backgroundColor = "rgba(50,50,50,0.2)";

//code+window-21,23631.5px,25906.9px
selectionBox.style.pointerEvents = "none";

//code+window-22,20570px,14826px
boardContainer.appendChild(selectionBox);

//code+window-23,20540px,16691px
boardContainer.addEventListener("mousedown", (e) => {
  // Return early if the Space button is down or panning is active
  if (dragBoard || isPanning) {
    return;
  }

  if (addTextMode) {
    addTextToBoard(e.offsetX, e.offsetY);
    return;
  }

  // Check if the user clicked on the board itself
  if (e.target === board || e.target === boardContainer) {
    // Unselect all windows if the user clicked on the board
    unselectAllWindows();
    startSelection(e);
  }
});

//code+window-24,20556px,15064px
boardContainer.addEventListener("mousemove", updateSelection);

//code+window-25,20551px,16242px
boardContainer.addEventListener("mouseup", endSelection);

//code+window-26,20583px,15865px
boardContainer.addEventListener("mousedown", startPanning);

//code+window-27,20571px,15228px
boardContainer.addEventListener("mouseup", endPanning);

//code+window-28,23736.7px,22302.9px
let isSelecting = false;

//code+window-29,23645.9px,25709.6px
let selectionStart = { x: 0, y: 0 };

//code+window-30,22189.1px,23166.4px
let startX, startY;

//code+window-31,23660.4px,25277.2px
function updateSelectionBoxBorder() {
  // Adjust the border size based on the current zoom level
  const borderSize = 1 / scale; // Adjust this calculation if needed
  selectionBox.style.borderWidth = borderSize + 'px';
}

//code+window-32,23684.3px,23584.3px
function startSelection(e) {
  if (e.target === board || e.target === boardContainer) {

    document.querySelectorAll('.window').forEach((windowEl) => {
      windowEl.classList.add('ignore-pointer-events');
    });

    //updateSelectionBoxBorder()

    isSelecting = true;
    startX = e.offsetX * scale;
    startY = e.offsetY * scale;

    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
    selectionBox.style.display = 'block'; // Add this line

    selectionBox.classList.add('active');

    //console.log("startX: ", startX, "startY: ", startY); // Add this line

    document.addEventListener("mousemove", updateSelection);
  }
}

//code+window-33,23685px,23201px
function updateSelection(e) {
  if (isSelecting) {

    const x = e.offsetX * scale;
    const y = e.offsetY * scale;
    const width = Math.abs(x - startX);
    const height = Math.abs(y - startY);

    //console.log("currentX: ", x, "currentY: ", y, "width: ", width, "height: ", height); // Add this line

    selectionBox.style.left = Math.min(x, startX) + 'px';
    selectionBox.style.top = Math.min(y, startY) + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
  }
}

//code+window-34,23661.5px,24122.6px
function endSelection() {
  if (isSelecting) {
    selectWindowsInsideSelectionBox(); // Call the function to select windows inside the selection box

    isSelecting = false;
    selectionBox.style.display = 'none';
    boardContainer.removeEventListener('mousemove', updateSelection);

    // Remove the 'ignore-pointer-events' class from all windows
    document.querySelectorAll('.window').forEach((windowEl) => {
      windowEl.classList.remove('ignore-pointer-events');
    });
  }
}

//code+window-35,23643.3px,24771.9px
function selectWindowsInsideSelectionBox() {
  console.log("here")

  const sb = selectionBox.getBoundingClientRect();

  // Iterate over all the code windows
  document.querySelectorAll('.window').forEach((windowEl) => {
    const w = windowEl.getBoundingClientRect()

    console.log("w.left: ", w.left, "sb.left: ", sb.left, "sb.right: ", sb.right, "w.left", w.left);
    // Check if the selection box intersects with the current code window
    if (sb.left < w.right &&
      sb.right > w.left &&
      sb.top < w.bottom &&
      sb.bottom > w.top
    ) {
      // If it intersects, add the current code window to the active windows
      console.log("intersect");
      toggleWindowSelection(windowEl);
    }
  });
}

//code+window-36,23649.1px,25528px
const selectedWindows = new Set();

//code+window-37,23745.7px,22056px
function toggleWindowSelection(windowEl) {
  if (selectedWindows.has(windowEl)) {
    selectedWindows.delete(windowEl);
    windowEl.style.border = "";
  } else {
    selectedWindows.add(windowEl);
    windowEl.style.border = "2px solid blue";
  }
}

//code+window-38,22472px,18700px
let initialPositions = new Map();

//code+window-39,22145.1px,25245.2px
function startDrag(e) {
  if (dragBoard || isEditable()) {
    // Skip dragging and selecting windows when panning the board
    return;
  }
  e.preventDefault();
  let target = e.target;

  console.log("start dragging ", target);

  // Find the closest parent element with the "window" or "text" class
  while (target && !target.classList.contains("window") && !target.classList.contains("draggable-text")) {
    target = target.parentElement;
  }

  console.log(target);

  if (target) {
    if (e.shiftKey) {
      toggleWindowSelection(target);
    } else {
      if (!selectedWindows.has(target)) {
        selectedWindows.clear();
        document.querySelectorAll(".window, .text").forEach((windowEl) => {
          windowEl.style.border = "";
        });
        // Add the target window to the selectedWindows set
        toggleWindowSelection(target);
      }
    }

    activeWindow = target;
    offsetX = e.clientX;
    offsetY = e.clientY;

    // Store the initial positions of all selected windows
    initialPositions.clear();
    selectedWindows.forEach((windowEl) => {
      initialPositions.set(windowEl, {
        x: parseFloat(windowEl.style.left) || 0,
        y: parseFloat(windowEl.style.top) || 0,
      });
    });

    activeWindow.style.position = "absolute";
    document.addEventListener("mousemove", moveWindow);
  }
}

//code+window-40,22153.5px,25037.2px
function endDrag() {
  activeWindows = [];
  document.removeEventListener("mousemove", moveWindow);
}

//code+window-41,22679.8px,23165.1px
function moveWindow(e) {
  if (activeWindow) {
    const deltaX = e.clientX - offsetX;
    const deltaY = e.clientY - offsetY;

    // Move all selected windows based on their initial positions
    selectedWindows.forEach((windowEl) => {
      const initialPosition = initialPositions.get(windowEl);

      const newWindowElX = initialPosition.x + deltaX / scale;
      const newWindowElY = initialPosition.y + deltaY / scale;

      windowEl.style.left = `${newWindowElX}px`;
      windowEl.style.top = `${newWindowElY}px`;
    });
  }
}

//code+window-42,22470px,18514px
let scale = 1;

//code+window-43,22458px,18344px
const scaleFactor = 0.03;

//code+window-44,21022.4px,23413.3px
let isPanning = false;

//code+window-45,21030.1px,23247.6px
let panStart = { x: 0, y: 0 };

//code+window-46,23658.3px,24514.4px
function unselectAllWindows() {
  selectedWindows.forEach((windowEl) => {
    windowEl.style.border = "";
  });
  selectedWindows.clear();
}

//code+window-47,20470px,18179px
board.style.transform = `scale(${scale})`;

//code+window-48,18893.8px,22186.5px
zoomInButton.addEventListener("click", () => {
  const prevScale = scale;
  scale += scaleFactor;

  const centerX = boardContainer.scrollLeft + boardContainer.clientWidth / 2;
  const centerY = boardContainer.scrollTop + boardContainer.clientHeight / 2;

  board.style.transform = `scale(${scale})`;

  boardContainer.scrollLeft = (centerX * scale) / prevScale - boardContainer.clientWidth / 2;
  boardContainer.scrollTop = (centerY * scale) / prevScale - boardContainer.clientHeight / 2;
});

//code+window-49,18995.8px,21019.5px
zoomOutButton.addEventListener("click", () => {
  const prevScale = scale;
  scale -= scaleFactor;
  if (scale < scaleFactor) {
    scale = scaleFactor;
  }

  const centerX = boardContainer.scrollLeft + boardContainer.clientWidth / 2;
  const centerY = boardContainer.scrollTop + boardContainer.clientHeight / 2;

  board.style.transform = `scale(${scale})`;

  boardContainer.scrollLeft = (centerX * scale) / prevScale - boardContainer.clientWidth / 2;
  boardContainer.scrollTop = (centerY * scale) / prevScale - boardContainer.clientHeight / 2;
});

//code+window-50,19055.8px,21476.5px
function zoomWithScroll(e) {
  // Check if the 'Command' or 'Control' key is pressed
  if (e.metaKey || e.ctrlKey) {
    e.preventDefault(); // Prevent the default scroll behavior

    // Determine the zoom direction based on the deltaY value
    const zoomDirection = e.deltaY > 0 ? -1 : 1;

    const prevScale = scale;
    scale += scaleFactor * zoomDirection;

    // Limit the minimum scale
    if (scale < scaleFactor) {
      scale = scaleFactor;
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const prevCenterX = boardContainer.scrollLeft + mouseX;
    const prevCenterY = boardContainer.scrollTop + mouseY;

    board.style.transform = `scale(${scale})`;

    const newCenterX = (prevCenterX * scale) / prevScale;
    const newCenterY = (prevCenterY * scale) / prevScale;

    boardContainer.scrollLeft = newCenterX - mouseX;
    boardContainer.scrollTop = newCenterY - mouseY;

    // Counteract scaling for window titles
    const windowTitles = document.querySelectorAll('.window-title');
    windowTitles.forEach(title => {
      title.style.transform = `scale(${1 / scale})`;
    });
  }
}

//code+window-51,20547px,16450px
boardContainer.addEventListener("wheel", zoomWithScroll);

//code+window-52,22676.6px,25024.1px
let dragBoard = false;

function isEditable() {
  const focusedElement = document.activeElement;
  return (
    focusedElement.tagName === "INPUT" ||
    focusedElement.tagName === "TEXTAREA" ||
    focusedElement.contentEditable === "true"
  );
}

//code+window-53,20576px,15445px
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    // If the focused element is editable, ignore the event
    if (isEditable()) {
      return;
    }
    e.preventDefault(); // Prevent default scrolling behavior
    dragBoard = true;
  }
});

//code+window-54,20577px,14549px
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    dragBoard = false;
  }
});

//code+window-55,21015.6px,23593.2px
function startPanning(e) {
  if (dragBoard && (e.target === board || e.target === boardContainer)) {
    isPanning = true;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
    boardContainer.style.cursor = "grabbing";
    document.addEventListener("mousemove", panBoard);
  }
}

//code+window-56,20995.8px,24163.8px
function endPanning() {
  isPanning = false;
  boardContainer.style.cursor = "";
  document.removeEventListener("mousemove", panBoard);
}

//code+window-57,20995.5px,23840px
function panBoard(e) {
  if (isPanning) {
    e.preventDefault();
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    boardContainer.scrollLeft -= deltaX;
    boardContainer.scrollTop -= deltaY;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
  }
}

//code+window-58,24204px,17777px
let addTextMode = false;

//code+window-59,24192px,16576px
const addTextButton = document.getElementById("addTextButton");

//code+window-60,24200px,16759px
addTextButton.addEventListener("click", () => {
  addTextMode = !addTextMode;
});

//code+window-61,24200px,16404px
let newTextElement = false;

//code+window-62,24193px,16990px
function addTextToBoard(x, y) {
  const textEl = document.createElement("div");
  textEl.classList.add("text");
  textEl.style.position = "absolute";
  textEl.style.left = `${x}px`;
  textEl.style.top = `${y}px`;
  textEl.style.border = "1px dashed transparent";
  textEl.contentEditable = true; // Set contentEditable to true initially
  textEl.textContent = "Type here...";

  newTextElement = true;

  textEl.addEventListener('focus', () => {
    textEl.classList.remove('draggable-text');
    textEl.style.userSelect = "auto";
  });

  textEl.addEventListener('blur', () => {
    if (newTextElement) {
      newTextElement = false;
    }
    textEl.classList.add('draggable-text');
    textEl.contentEditable = false; // Disable editing when the element loses focus
    textEl.style.userSelect = "none";
  });

  textEl.addEventListener('mousedown', startDrag)
  textEl.addEventListener('mousedup', endDrag)

  textEl.addEventListener('dblclick', (e) => {
    if (!newTextElement) {
      textEl.contentEditable = true; // Enable editing on double-click
      textEl.focus();
      e.stopPropagation();
    }
  });

  textEl.classList.add('draggable-text');
  textEl.style.userSelect = "none";
  board.appendChild(textEl);
  textEl.focus();
}

//code+window-63,27634px,17637px
const fetchButton = document.getElementById("fetchButton");

//code+window-64,25617px,18241px
const submitButton = document.getElementById("submit");

//code+window-65,25613px,18065px
const cancelButton = document.getElementById("cancel");

//code+window-66,25644px,17861px
const overlay = document.getElementById("overlay");

//code+window-67,25659px,17665px
const popup = document.getElementById("popup");

//code+window-68,27615px,18705px
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode("0x" + p1);
  }));
}

//code+window-69,28363px,18708px
function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
}

//code+window-70,27597px,18979px
fetchButton.addEventListener("click", () => {
  overlay.style.display = "block";
  popup.style.display = "block";
});

//code+window-71,25597px,18425px
cancelButton.addEventListener("click", () => {
  overlay.style.display = "none";
  popup.style.display = "none";
});

//code+window-72,30325px,21297px
submitButton.addEventListener("click", () => {
  owner = document.getElementById("owner").value;
  repo = document.getElementById("repo").value;
  filePath = document.getElementById("path").value;
  branch = document.getElementById("branch").value;
  token = document.getElementById("token").value;

  fetchFileFromGitHub(owner, repo, branch, filePath, token);
  overlay.style.display = "none";
  popup.style.display = "none";
});

//code+window-73,27629px,18457px
let fileExtension;

let overview;

//code+window-74,27568px,20837px
function fetchFileFromGitHub(owner, repo, branch, filePath, token) {
  const headers = new Headers();
  headers.append("Authorization", `token ${token}`);
  headers.append("Accept", "application/vnd.github+json");

  fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, {
    headers: headers,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error fetching the file");
      }
    })
    .then((data) => {
      const content = b64DecodeUnicode(data.content);
      fileExtension = filePath.split('.').pop().toLowerCase();
      parsedBlocks = splitBlocks(content, fileExtension);
      let useParsedBlocks = true;

      if (parsedBlocks.length === 0 || parsedBlocks.some(block => block === null)) {
        let useParsedBlocks = no;
        if (fileExtension === 'js') {
          parsedBlocks = parseJsCodeUsingAcorn(content);
        } else if (fileExtension === 'lisp') {
          parsedBlocks = parseLispCode(content);
        } else {
          console.error('Unsupported file type');
          return;
        }
      }

      overview = generateOverview(content);
      const formattedOverview = formatOverview(overview);
      console.log(formattedOverview);

      const searchTerms = [
        { type: 'let', snippet: 'scale' },
        {
          type: 'topLevelExpressions',
          snippet: 'boardContainer.scrollLeft = (boardWidth - boardContainer.clientWidth) / 2',
        },
        {
          type: 'topLevelExpressions',
          snippet: 'boardContainer.addEventListener("mousedown", (e) => ',
        },
      ];

      const matchedResult = matchCodeBlocks(parsedBlocks, searchTerms);
      console.log("matchedResult: ", matchedResult);

      console.log("codeBlcocks: ", getCodeBlocksByIds(parsedBlocks, matchedResult));

      createDraggableWindows(parsedBlocks, useParsedBlocks);
    })
    .catch((error) => {
      console.error("Error fetching the file:", error);
    });
}

//code+window-741,27630px,18065px
function getCodeBlocksByIds(parsedBlocks, ids) {
  const codeBlocks = [];
  const idPattern = /\/\/code\+window-(\d+)/;

  console.log("parsedBlocks in getBlcoksByIDs: ", parsedBlocks);

  for (const block of parsedBlocks) {
    //console.log(block);
    const match = block.match(idPattern);

    if (match && ids.includes(parseInt(match[1]))) {
      codeBlocks.push(block);
    }
  }

  return codeBlocks;
}

//code+window-75,27630px,18065px
function getCodeBlocksByIds(parsedBlocks, ids) {
  const codeBlocks = [];

  for (const block of parsedBlocks) {
    if (ids.includes(block.id)) {
      codeBlocks.push(block);
    }
  }

  return codeBlocks;
}

//code+window-751,29135px,17526px
function generateOverview(code) {
  const ast = acorn.parse(code, { ecmaVersion: 'latest' });
  const overview = {
    const: [],
    let: [],
    functionDefinitions: [],
    topLevelExpressions: [],
  };

  //test changing code

  ast.body.forEach((node) => {
    if (node.type === 'VariableDeclaration') {
      const kind = node.kind;
      const declarations = node.declarations.map((declaration) => declaration.id.name);

      if (kind === 'const') {
        overview.const.push(...declarations);
      } else if (kind === 'let') {
        overview.let.push(...declarations);
      }
    } else if (node.type === 'FunctionDeclaration') {
      overview.functionDefinitions.push(node.id.name);
    } else if (node.type === 'ExpressionStatement') {
      const start = code.substring(0, node.start).lastIndexOf('\n') + 1;
      const end = code.indexOf('\n', node.end);
      const expression = code.substring(start, end === -1 ? code.length : end);
      const firstLineExpression = expression.split('\n')[0].trim();

      if (firstLineExpression.includes('.style.')) {
        // Ignore style-related expressions
      } else if (firstLineExpression.includes('.addEventListener(')) {
        const shortExpression = firstLineExpression.replace(/\{[\s\S]*\}/, '');
        overview.topLevelExpressions.push(shortExpression);
      } else {
        overview.topLevelExpressions.push(firstLineExpression);
      }
    }
  });

  return overview;
}

//code+window-752,29113px,18287px
function formatOverview(overview) {
  let formattedOverview = '';

  for (const key in overview) {
    if (overview[key].length > 0) {
      formattedOverview += `${key}: ${overview[key].join(', ')}\n`;
    }
  }

  return formattedOverview.trim();
}

//code+window-76,27555.3px,23378px
const splitBlocks = (text, fileExtension) => {
  const commentChar = fileExtension === 'js' ? '//' : ';';
  const regexPattern = new RegExp(`${commentChar}code\\+window-(\\d+),(\\d+(?:\\.\\d+)?)px,(\\d+(?:\\.\\d+)?)px\\n?([\\s\\S]*?)(?=${commentChar}code\\+window-|$)`, 'g');

  let match;
  const codeBlocks = [];

  while ((match = regexPattern.exec(text)) !== null) {
    codeBlocks.push({
      id: parseInt(match[1], 10),
      x: parseInt(match[2], 10),
      y: parseInt(match[3], 10),
      code: match[4].trim(),
    });
  }

  return codeBlocks;
}

//code+window-761,27528.6px,23824.7px
function matchCodeBlocks(codeBlocks, searchTerms) {
  const matchedBlocks = [];

  const keywords = {
    const: /^const\s+([a-zA-Z_$][a-zA-Z_$0-9]*)/,
    let: /^let\s+([a-zA-Z_$][a-zA-Z_$0-9]*)/,
    functionDefinitions: /^function\s+([a-zA-Z_$][a-zA-Z_$0-9]*)/,
    topLevelExpressions: /^[a-zA-Z_$][a-zA-Z_$0-9]*\..*?\);?/,
  };

  for (const searchTerm of searchTerms) {
    const { type, snippet } = searchTerm;
    for (const block of codeBlocks) {
      if (type in keywords) {
        const regex = keywords[type];
        if (regex.test(block.code) && block.code.includes(snippet)) {
          matchedBlocks.push(block.id);
        }
      }
    }
  }

  return matchedBlocks;
}

//code+window-77,27536.3px,22087px
function parseLispCode(code) {
  let codeBlocks = [];
  let currentBlock = '';
  let openParentheses = 0;
  let inString = false;
  let inComment = false;

  function getSurroundingLines(code, position, numLines = 5) {
    const lines = code.split('\n');
    let currentPos = 0;
    let lineNumber = 0;

    while (currentPos <= position && lineNumber < lines.length) {
      currentPos += lines[lineNumber].length + 1;
      lineNumber++;
    }

    const startLine = Math.max(0, lineNumber - numLines - 1);
    const endLine = Math.min(lines.length, lineNumber + numLines);

    return {
      line: lineNumber,
      surroundingLines: lines.slice(startLine, endLine).join('\n'),
    };
  }

  for (let i = 0; i < code.length; i++) {
    const currentChar = code[i];
    const nextChar = code[i + 1];
    const prevChar = i > 0 ? code[i - 1] : null;

    if (inComment) {
      if (currentChar === '\n') {
        inComment = false;
      }
      currentBlock += currentChar;
      continue;
    }

    if (currentChar === '"' && !inString && prevChar !== '\\') {
      inString = true;
    } else if (currentChar === '"' && inString && prevChar !== '\\') {
      inString = false;
    }

    if (!inString) {
      if (currentChar === ';') {
        inComment = true;
        currentBlock += currentChar;
        continue;
      }

      if (currentChar === '(') {
        openParentheses++;
      } else if (currentChar === ')') {
        openParentheses--;
        if (openParentheses < 0) {
          const { line, surroundingLines } = getSurroundingLines(code, i);
          throw new Error(`Mismatched closing parenthesis at position ${i} (line ${line}):\n\n${surroundingLines}`);
        }
      }
    }

    currentBlock += currentChar;

    if (openParentheses === 0 && (nextChar === '\n' || i === code.length - 1)) {
      codeBlocks.push(currentBlock.trim());
      currentBlock = '';
    }
  }

  return codeBlocks.filter(block => block.length > 0);
}

//code+window-78,30333px,20918px
const saveButton = document.getElementById("saveButton");

//code+window-79,30336px,21054px
saveButton.addEventListener("click", () => {
  //const branch = "wavyton-spaces";
  const commitMessage = "Update combined";

  const combinedCode = concatenateCodePieces(fileExtension);

  pushFileToGitHub(owner, repo, branch, token, filePath, commitMessage, combinedCode);
});

//code+window-80,30324px,21588px
async function pushFileToGitHub(owner, repo, branch, token, filePath, commitMessage, content) {
  try {
    const headers = new Headers();
    headers.append("Authorization", `token ${token}`);
    headers.append("Accept", "application/vnd.github+json");

    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    // Check if the file already exists
    const fileResponse = await fetch(getFileUrl, { headers: headers });
    let sha = null;

    if (fileResponse.ok) {
      const fileData = await fileResponse.json();
      sha = fileData.sha;
    } else if (fileResponse.status !== 404) {
      console.error("Error fetching the file:", fileResponse.statusText);
      return;
    }

    const base64Content = b64EncodeUnicode(content);
    //const base64Content = b64EncodeUnicode(unescape(encodeURIComponent(content)));

    const payload = {
      message: commitMessage,
      content: base64Content,
      branch: branch,
    };

    if (sha) {
      payload.sha = sha;
    }

    const pushResponse = await fetch(getFileUrl, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (pushResponse.ok) {
      console.log("File successfully pushed to GitHub");
    } else {
      const errorData = await pushResponse.json();
      console.error("Error pushing the file:", errorData);
    }
  } catch (error) {
    console.error("Error pushing the file:", error.message);
  }
}

//code+window-81,30314px,22575px
function concatenateCodePieces(fileExtension) {
  const windows = document.querySelectorAll(".window");
  let concatenatedCode = "";
  const commentChar = fileExtension === 'js' ? '//' : ';';

  windows.forEach((windowEl) => {
    const codeEl = windowEl.querySelector("pre");
    if (codeEl) {
      console.log(windowEl.style.left, windowEl.style.top)
      concatenatedCode += `${commentChar}code+${windowEl.id},${windowEl.style.left},${windowEl.style.top}\n`;
      concatenatedCode += codeEl.textContent;
      concatenatedCode += "\n\n"; // Add an empty line between code blocks
    }
  });

  return concatenatedCode;
}

//code+window-82,31247px,18078px
async function callOpenAI(messages) {
  try {
    const response = await fetch('https://wavyton-spaces-server.ivanpashchenko2.repl.co/api/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log("response: ", data);
    return data.completion;
  } catch (error) {
    console.error('Error fetching completion:', error);
    throw error;
  }
}

//code+window-83,27591px,19242px
document.getElementById('openAIForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the form from submitting and reloading the page

  try {
    const userInput = document.getElementById('prompt').value;
    console.log("here1");
    //const overview = generateOverview(parsedBlocks);
    console.log("here2");
    const formattedOverview = formatOverview(overview);
    console.log("here: ", formattedOverview);

    const initialMessage = `Given a user's question about the code of the current project, which could be related to a specific functionality, copy changes, debugging, or a new feature (e.g., changing the button color), please return the relevant code references from the provided code overview ONLY. The code references should include the type (e.g., 'const', 'let', 'functionDefinitions', 'topLevelExpressions') and the corresponding code snippet. Do not provide references that are not part of the provided code overview. The code language is JavaScript. Please refer to the example provided:\nInput: “User: I want to change the color of the “Add text” button to red.”\nOutput: [ { type: 'const', snippet: 'addTextButton' }, ];\n\nHere is the code overview: ${formattedOverview}`;

    const messages = [
      { role: "system", content: initialMessage },
      { role: "user", content: userInput },
    ];

    //const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    let completion = await callOpenAI(messages);
    console.log("response: ", completion);

    //const searchTerms = extractSearchTerms(completion);
    const ids = matchCodeBlocks(parsedBlocks, completion);
    const codeBlocks = getCodeBlocksByIds(parsedBlocks, ids);

    const highestId = parsedBlocks.reduce((maxId, block) => {
      return Math.max(maxId, block.id);
    }, 0);

    const newMessages = [
      {
        role: "system",
        content: `Here is the code overview and relevant code blocks based on your previous question:
    
        ${formattedOverview}
        ${codeBlocks}
    
        The highest id currently in use is ${highestId}. Please answer the user's question again, considering the following:
    
        - If modifying existing code, use the same id and coordinates as the current code block, like this:
          { "code": "code snippet", "id": 2, "x": 19844, "y": 20869 }
    
        - If creating a new code block, use an id greater than the highest id, and place it at coordinates 0, 0, like this:
          { "code": "code snippet", "id": ${highestId + 1}, "x": 0, "y": 0 }
    
        Keep in mind that multiple new blocks can be created.
    
        IMPORTANT: Your response should strictly follow the provided format and only include the array of code blocks. There should be no other text besides the array elements.`,
      },
      {
        role: "user",
        content: userInput,
      },
    ];


    completion = await callOpenAI(newMessages);
    console.log("response: ", completion);

    const codeBlocksToUpdate = JSON.parse(completion);
    console.log("response: ", codeBlocksToUpdate);

    // Update parsedBlocks and create/update draggable windows
    codeBlocksToUpdate.forEach((block) => {
      const existingBlockIndex = parsedBlocks.findIndex((parsedBlock) => parsedBlock.id === block.id);

      if (existingBlockIndex !== -1) {
        // Update the existing block in parsedBlocks
        parsedBlocks[existingBlockIndex].code = block.code;

        // Update the draggable window on the board
        const windowEl = document.getElementById(`window-${block.id}`);
        if (windowEl) {
          const codeEl = windowEl.querySelector("pre");
          if (codeEl) {
            codeEl.textContent = block.code;
          }
        }
      } else {
        // Add the new block to parsedBlocks
        parsedBlocks.push({
          id: block.id,
          x: block.x,
          y: block.y,
          code: block.code,
        });

        // Create a new draggable window on the board
        createDraggableWindows([parsedBlocks[parsedBlocks.length - 1]], true);
      }
    });

    document.getElementById('openAIOutput').value = completion;
  } catch (error) {
    console.error('Error:', error);
  }
});

//code+window-84,27569px,19908px
async function getCodeBlockEmbeddings(codeBlocks) {
  const validCodeBlocks = codeBlocks.filter(block => block !== null && block !== undefined);

  if (validCodeBlocks.length === 0) {
    throw new Error('No valid code blocks found');
  }

  console.log("codeBlocks from api", codeBlocks);
  const response = await fetch('https://openAI.ivanpashchenko2.repl.co/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ codeBlocks: validCodeBlocks }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.embeddings;
  } else {
    throw new Error('Failed to get code block embeddings');
  }
}

//code+window-85,27586px,19573px
document.getElementById('generate-embeddings').addEventListener('click', async () => {
  try {
    const embeddings = await getCodeBlockEmbeddings(parsedBlocks);
    console.log('Embeddings:', embeddings);
  } catch (error) {
    console.error('Error:', error);
  }
});

//code+window-86,27569px,20439px
async function getCodeBlockEmbedding(codeBlock) {
  const response = await fetch('https://openai.ivanpashchenko2.repl.co/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ codeBlocks: [codeBlock] }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.embeddings[0];
  } else {
    throw new Error('Failed to get code block embedding');
  }
}

//code+window-762,28353px,15791px
saveButton.style.fontSize = '20px';

//code+window-763,28365px,15641px
saveButton.style.backgroundColor = 'red';

//code+window-764,19600.1px,19283.3px
addTextButton.style.backgroundColor = 'green';

