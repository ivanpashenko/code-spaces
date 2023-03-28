const boardContainer = document.getElementById("boardContainer");
const board = document.getElementById("board");
const zoomInButton = document.getElementById("zoomIn");
const zoomOutButton = document.getElementById("zoomOut");

const boardWidth = 50000; // Set the board width
const boardHeight = 40000; // Set the board height

board.style.width = `${boardWidth}px`;
board.style.height = `${boardHeight}px`;

let parsedBlocks = []
let owner, repo, filePath, branch, token;
let windowCounter = 0; // Add a window counter to assign unique IDs

boardContainer.scrollLeft = (boardWidth - boardContainer.clientWidth) / 2;
boardContainer.scrollTop = (boardHeight - boardContainer.clientHeight) / 2;

let offsetX = 0;
let offsetY = 0;
let activeWindows = [];

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


// Add a new div for the selection box
const selectionBox = document.createElement("div");
selectionBox.style.position = "absolute";
selectionBox.style.border = "1px dashed gray";
selectionBox.style.backgroundColor = "rgba(50,50,50,0.2)";
selectionBox.style.pointerEvents = "none";
//selectionBox.style.display = "none";
boardContainer.appendChild(selectionBox);

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

boardContainer.addEventListener("mousemove", updateSelection);
boardContainer.addEventListener("mouseup", endSelection);

boardContainer.addEventListener("mousedown", startPanning);
boardContainer.addEventListener("mouseup", endPanning);

let isSelecting = false;
let selectionStart = { x: 0, y: 0 };
let startX, startY;

function updateSelectionBoxBorder() {
  // Adjust the border size based on the current zoom level
  const borderSize = 1 / scale; // Adjust this calculation if needed
  selectionBox.style.borderWidth = borderSize + 'px';
}

function startSelection(e) {
  if (e.target === board || e.target === boardContainer) {

    document.querySelectorAll('.window').forEach((windowEl) => {
      windowEl.classList.add('ignore-pointer-events');
    });

    //updateSelectionBoxBorder()
    
    isSelecting = true;
    startX = e.offsetX * scale;
    startY = e.offsetY * scale ;

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



const selectedWindows = new Set();

function toggleWindowSelection(windowEl) {
  if (selectedWindows.has(windowEl)) {
    selectedWindows.delete(windowEl);
    windowEl.style.border = "";
  } else {
    selectedWindows.add(windowEl);
    windowEl.style.border = "2px solid blue";
  }
}

let initialPositions = new Map();


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


function endDrag() {
  activeWindows = [];
  document.removeEventListener("mousemove", moveWindow);
}

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


let scale = 1;
const scaleFactor = 0.03;
let isPanning = false;
let panStart = { x: 0, y: 0 };

function unselectAllWindows() {
  selectedWindows.forEach((windowEl) => {
    windowEl.style.border = "";
  });
  selectedWindows.clear();
}


board.style.transform = `scale(${scale})`;

zoomInButton.addEventListener("click", () => {
  const prevScale = scale;
  scale += scaleFactor;

  const centerX = boardContainer.scrollLeft + boardContainer.clientWidth / 2;
  const centerY = boardContainer.scrollTop + boardContainer.clientHeight / 2;

  board.style.transform = `scale(${scale})`;

  boardContainer.scrollLeft = (centerX * scale) / prevScale - boardContainer.clientWidth / 2;
  boardContainer.scrollTop = (centerY * scale) / prevScale - boardContainer.clientHeight / 2;
});

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


// Add a 'wheel' event listener to the 'boardContainer' element
boardContainer.addEventListener("wheel", zoomWithScroll);


let dragBoard = false;

// Add event listeners for 'keydown' and 'keyup'
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // Prevent default scrolling behavior
    dragBoard = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    dragBoard = false;
  }
});

// Modify the 'startPanning' function
function startPanning(e) {
  if (dragBoard && (e.target === board || e.target === boardContainer)) {
    isPanning = true;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
    boardContainer.style.cursor = "grabbing";
    document.addEventListener("mousemove", panBoard);
  }
}

function endPanning() {
  isPanning = false;
  boardContainer.style.cursor = "";
  document.removeEventListener("mousemove", panBoard);
}

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

//Add text to the board
let addTextMode = false;

const addTextButton = document.getElementById("addTextButton");

addTextButton.addEventListener("click", () => {
  addTextMode = !addTextMode;
});

// function addTextToBoard(x, y) {
//   const textEl = document.createElement("div");
//   textEl.classList.add("text");
//   textEl.contentEditable = "true";
//   textEl.style.position = "absolute";
//   textEl.style.left = `${x}px`;
//   textEl.style.top = `${y}px`;
//   textEl.style.minWidth = "100px";
//   textEl.style.minHeight = "20px";
//   textEl.style.border = "1px solid green";
//   textEl.style.color = "white";
//   textEl.style.padding = "5px";
//   textEl.style.borderRadius = "5px";
//   board.appendChild(textEl);

//   setTimeout(() => {
//     textEl.focus();
//   }, 50);

//   textEl.addEventListener('blur', () => {
//     textEl.classList.add('draggable-text');
//   });

//   // Add the 'draggable-text' class to the text element initially
//   textEl.classList.add('draggable-text');
// }

let newTextElement = false;

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





//Fetch from Github
const fetchButton = document.getElementById("fetchButton");
const submitButton = document.getElementById("submit");
const cancelButton = document.getElementById("cancel");
const overlay = document.getElementById("overlay");
const popup = document.getElementById("popup");

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode("0x" + p1);
  }));
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
}

fetchButton.addEventListener("click", () => {
  overlay.style.display = "block";
  popup.style.display = "block";
});

cancelButton.addEventListener("click", () => {
  overlay.style.display = "none";
  popup.style.display = "none";
});

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

let fileExtension;

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

      if (parsedBlocks.length === 0 || parsedBlocks.some(block => block === null)) {
        if (fileExtension === 'js') {
          parsedBlocks = parseJsCodeUsingAcorn(content);
        } else if (fileExtension === 'lisp') {
          parsedBlocks = parseLispCode(content);
        } else {
          console.error('Unsupported file type');
          return;
        }
      }
      createDraggableWindows(parsedBlocks);
    })
    .catch((error) => {
      console.error("Error fetching the file:", error);
    });
}

//end of fetch from github

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

const splitBlocks = (text, fileExtension) => {
  const commentChar = fileExtension === 'js' ? '//' : ';';
  const blocks = text.split(`${commentChar}code+window-`).slice(1);
  const regexPattern = `^${commentChar}code\\+(\\d+),(\\d+(?:\\.\\d+)?)px,(\\d+(?:\\.\\d+)?)px\\n?([\\s\\S]*?)(?=;code\\+window-|$)`;

  return blocks.map((block) => {
    const match = block.match(new RegExp(regexPattern));
    if (!match) {
      console.log("Unmatched block content:", block);
      return null;
    }

    return {
      id: parseInt(match[1], 10),
      x: parseInt(match[2], 10),
      y: parseInt(match[3], 10),
      code: match[4].trim(),
    };
  });
};


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

//Push to Github
const saveButton = document.getElementById("saveButton");

saveButton.addEventListener("click", () => {
  //const branch = "wavyton-spaces";
  const commitMessage = "Update combined.lisp";
  
  const combinedCode = concatenateCodePieces();
  
  pushFileToGitHub(owner, repo, branch, token, filePath, commitMessage, combinedCode);
});

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


function concatenateCodePieces(fileExtension) {
  const windows = document.querySelectorAll(".window");
  let concatenatedCode = "";
  const commentChar = fileExtension === 'js' ? '//' : ';';

  windows.forEach((windowEl) => {
    const codeEl = windowEl.querySelector("pre");
    if (codeEl) {
      concatenatedCode += `${commentChar}code+${windowEl.id},${windowEl.style.left},${windowEl.style.top}\n`;
      concatenatedCode += codeEl.textContent;
      concatenatedCode += "\n\n"; // Add an empty line between code blocks
    }
  });

  return concatenatedCode;
}


//OpenAI

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


document.getElementById('testOpenAI').addEventListener('click', async () => {
  try {
    const prompt = 'Translate the following English text to French: "Hello, how are you?"';
    const completion = await callOpenAI(prompt);
    document.getElementById('openAIOutput').value = completion;
  } catch (error) {
    console.error('Error:', error);
  }
});

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


document.getElementById('generate-embeddings').addEventListener('click', async () => {
  try {
    const embeddings = await getCodeBlockEmbeddings(parsedBlocks);
    console.log('Embeddings:', embeddings);
  } catch (error) {
    console.error('Error:', error);
  }
});

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


