//code+window-0,20389.1px,18099.9px
const boardContainer = document.getElementById("boardContainer");

//code+window-1,20398.5px,17947.2px
const board = document.getElementById("board");

//code+window-2,20778.8px,20536.1px
const zoomInButton = document.getElementById("zoomIn");

//code+window-3,20756.8px,20372.9px
const zoomOutButton = document.getElementById("zoomOut");

//code+window-4,20363.8px,18720.9px
const boardWidth = 50000; // Set the board width

//code+window-5,20352.2px,18552.5px
const boardHeight = 40000; // Set the board height

//code+window-6,20372.2px,18247.2px
board.style.width = `${boardWidth}px`;

//code+window-7,20355.4px,18378.7px
board.style.height = `${boardHeight}px`;

//code+window-8,22490px,20073.7px
let parsedBlocks = []

//code+window-9,27681.4px,16717.5px
let owner, repo, filePath, branch, token;

//code+window-10,24515.7px,21542.9px
let windowCounter = 0; // Add a window counter to assign unique IDs

//code+window-11,20607.1px,15685.7px
boardContainer.scrollLeft = (boardWidth - boardContainer.clientWidth) / 2;

//code+window-12,20227.1px,16457.1px
boardContainer.scrollTop = (boardHeight - boardContainer.clientHeight) / 2;

//code+window-13,23547.1px,19757.1px
let offsetX = 0;

//code+window-14,23395.7px,19585.7px
let offsetY = 0;

//code+window-15,24458.6px,21842.8px
let activeWindows = [];

//code+window-16,22207.9px,21136.9px
function createDraggableWindows(codePieces, useParsedBlocks = false) {
  console.log("Creating draggable windows with:", codePieces, useParsedBlocks);
  const horizontalSpacing = 20;

  const functionNameRegex = /(?:(?:tw-)?def[\w-]*)\s+([a-zA-Z0-9_]+)/;

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
    if (match && match[1]) {
      const titleEl = document.createElement("div");
      titleEl.classList.add("window-title");
      titleEl.style.transformOrigin = 'bottom left';
      titleEl.textContent = match[1];
      windowEl.appendChild(titleEl);
    }

    const codeEl = document.createElement("pre");
    codeEl.textContent = piece;
    windowEl.appendChild(codeEl);

    windowEl.style.position = "absolute";
    windowEl.addEventListener("mousedown", startDrag);
    board.appendChild(windowEl);
  });

  document.addEventListener("mouseup", endDrag);
}

//code+window-17,25084.3px,22928.5px
const selectionBox = document.createElement("div");

//code+window-18,25104.3px,23328.6px
selectionBox.style.position = "absolute";

//code+window-19,25367.2px,23900px
selectionBox.style.border = "1px dashed gray";

//code+window-20,25344.3px,23628.6px
selectionBox.style.backgroundColor = "rgba(50,50,50,0.2)";

//code+window-21,23821.4px,27128.6px
selectionBox.style.pointerEvents = "none";

//code+window-22,20770px,14585.7px
boardContainer.appendChild(selectionBox);

//code+window-23,20290px,17400px
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

//code+window-24,20381.4px,14914.3px
boardContainer.addEventListener("mousemove", updateSelection);

//code+window-25,20201.4px,16842.9px
boardContainer.addEventListener("mouseup", endSelection);

//code+window-26,20092.9px,16057.1px
boardContainer.addEventListener("mousedown", startPanning);

//code+window-27,20255.7px,15128.6px
boardContainer.addEventListener("mouseup", endPanning);

//code+window-28,23689.9px,22857.1px
let isSelecting = false;

//code+window-29,23767.1px,26657.1px
let selectionStart = { x: 0, y: 0 };

//code+window-30,23344.3px,19357.2px
let startX, startY;

//code+window-31,23692.8px,25814.3px
function updateSelectionBoxBorder() {
  // Adjust the border size based on the current zoom level
  const borderSize = 1 / scale; // Adjust this calculation if needed
  selectionBox.style.borderWidth = borderSize + 'px';
}

//code+window-32,23679px,23758.6px
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

//code+window-33,23685.6px,23201.1px
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

//code+window-34,23651.7px,24370.4px
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

//code+window-35,23717.9px,25193.5px
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

//code+window-36,23707.1px,26228.6px
const selectedWindows = new Set();

//code+window-37,23683.2px,22242.9px
function toggleWindowSelection(windowEl) {
  if (selectedWindows.has(windowEl)) {
    selectedWindows.delete(windowEl);
    windowEl.style.border = "";
  } else {
    selectedWindows.add(windowEl);
    windowEl.style.border = "2px solid blue";
  }
}

//code+window-38,22447.1px,18842.8px
let initialPositions = new Map();

//code+window-39,22231.1px,21900px
function startDrag(e) {
  if (dragBoard) {
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

//code+window-40,22201.4px,22957.2px
function endDrag() {
  activeWindows = [];
  document.removeEventListener("mousemove", moveWindow);
}

//code+window-41,22859.3px,20570.5px
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

//code+window-42,22470px,18514.3px
let scale = 1;

//code+window-43,22475.7px,18228.6px
const scaleFactor = 0.03;

//code+window-44,20667.1px,23571.4px
let isPanning = false;

//code+window-45,20701.5px,23200px
let panStart = { x: 0, y: 0 };

//code+window-46,23732.1px,24867.5px
function unselectAllWindows() {
  selectedWindows.forEach((windowEl) => {
    windowEl.style.border = "";
  });
  selectedWindows.clear();
}

//code+window-47,20312.8px,18971.4px
board.style.transform = `scale(${scale})`;

//code+window-48,20674.6px,21892.3px
zoomInButton.addEventListener("click", () => {
  const prevScale = scale;
  scale += scaleFactor;

  const centerX = boardContainer.scrollLeft + boardContainer.clientWidth / 2;
  const centerY = boardContainer.scrollTop + boardContainer.clientHeight / 2;

  board.style.transform = `scale(${scale})`;

  boardContainer.scrollLeft = (centerX * scale) / prevScale - boardContainer.clientWidth / 2;
  boardContainer.scrollTop = (centerY * scale) / prevScale - boardContainer.clientHeight / 2;
});

//code+window-49,20776.8px,20725.5px
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

//code+window-50,20836.3px,21182.8px
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

//code+window-51,20364.3px,17100px
boardContainer.addEventListener("wheel", zoomWithScroll);

//code+window-52,22184.3px,23385.7px
let dragBoard = false;

//code+window-53,19701.1px,15404.3px
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // Prevent default scrolling behavior
    dragBoard = true;
  }
});

//code+window-54,22019.9px,15258.3px
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    dragBoard = false;
  }
});

//code+window-55,20676.2px,23893.4px
function startPanning(e) {
  if (dragBoard && (e.target === board || e.target === boardContainer)) {
    isPanning = true;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
    boardContainer.style.cursor = "grabbing";
    document.addEventListener("mousemove", panBoard);
  }
}

//code+window-56,20693.3px,24653.6px
function endPanning() {
  isPanning = false;
  boardContainer.style.cursor = "";
  document.removeEventListener("mousemove", panBoard);
}

//code+window-57,20619.8px,24245.1px
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

//code+window-58,24190.1px,17885.7px
let addTextMode = false;

//code+window-59,24067.2px,16299.9px
const addTextButton = document.getElementById("addTextButton");

//code+window-60,24130px,16600px
addTextButton.addEventListener("click", () => {
  addTextMode = !addTextMode;
});

//code+window-61,24126.9px,15919.8px
let newTextElement = false;

//code+window-62,24193.3px,16990.6px
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

//code+window-63,28618.6px,18071.5px
const fetchButton = document.getElementById("fetchButton");

//code+window-64,26067.1px,18400px
const submitButton = document.getElementById("submit");

//code+window-65,26030px,18157.1px
const cancelButton = document.getElementById("cancel");

//code+window-66,26378.6px,17928.6px
const overlay = document.getElementById("overlay");

//code+window-67,26484.3px,17657.1px
const popup = document.getElementById("popup");

//code+window-68,27232.9px,18914.3px
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode("0x" + p1);
  }));
}

//code+window-69,27338.6px,18500px
function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
}

//code+window-70,27172.9px,19371.4px
fetchButton.addEventListener("click", () => {
  overlay.style.display = "block";
  popup.style.display = "block";
});

//code+window-71,26064.2px,18700px
cancelButton.addEventListener("click", () => {
  overlay.style.display = "none";
  popup.style.display = "none";
});

//code+window-72,29170px,22000px
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

//code+window-73,27304.2px,17957.2px
let fileExtension;

//code+window-74,27202.2px,22046.2px
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
      let parsedBlocks = splitBlocks(content, fileExtension);
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

      createDraggableWindows(parsedBlocks, useParsedBlocks);
    })
    .catch((error) => {
      console.error("Error fetching the file:", error);
    });
}

//code+window-75,27372.9px,17257.1px
function parseJsCodeUsingAcorn(code) {
  const ast = acorn.parse(code, { ecmaVersion: 'latest' });
  const blocks = [];

  ast.body.forEach((node) => {
    const start = code.substring(0, node.start).lastIndexOf('\n') + 1;
    const end = code.indexOf('\n', node.end);
    const block = code.substring(start, end === -1 ? code.length : end);
    blocks.push(block.trim());
  });

  return blocks;
}

//code+window-76,27121.4px,24328.6px
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

//code+window-77,27177.7px,22838.5px
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

//code+window-78,29675.7px,21085.7px
const saveButton = document.getElementById("saveButton");

//code+window-79,29181.4px,21671.4px
saveButton.addEventListener("click", () => {
  //const branch = "wavyton-spaces";
  const commitMessage = "Update combined";

  const combinedCode = concatenateCodePieces(fileExtension);

  pushFileToGitHub(owner, repo, branch, token, filePath, commitMessage, combinedCode);
});

//code+window-80,29183.8px,22439.6px
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

//code+window-81,29364.3px,23642.8px
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

//code+window-82,31214px,20137.3px
async function callOpenAI(prompt) {
  const response = await fetch('https://openAI.ivanpashchenko2.repl.co/api/completion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.completion;
  } else {
    throw new Error('Failed to call OpenAI API');
  }
}

//code+window-83,27166.9px,19684.6px
document.getElementById('testOpenAI').addEventListener('click', async () => {
  try {
    const prompt = 'Translate the following English text to French: "Hello, how are you?"';
    const completion = await callOpenAI(prompt);
    document.getElementById('openAIOutput').value = completion;
  } catch (error) {
    console.error('Error:', error);
  }
});

//code+window-84,27194.6px,20800px
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

//code+window-85,27153.1px,20215.4px
document.getElementById('generate-embeddings').addEventListener('click', async () => {
  try {
    const embeddings = await getCodeBlockEmbeddings(parsedBlocks);
    console.log('Embeddings:', embeddings);
  } catch (error) {
    console.error('Error:', error);
  }
});

//code+window-86,27219.2px,21423.1px
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

