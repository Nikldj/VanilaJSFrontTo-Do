let allTask = [];
let input = null;
let value = "";
let edit = false;
let checkItem = 0;

window.onload = async () => {
  input = document.getElementById("input_task");
  input.addEventListener("input", (elem) => (value = elem.target.value));
  const response = await fetch("http://localhost:8000/allTasks", {
    method: "GET",
  });
  let result = await response.json();
  allTask = result.data;
  render();
};

const addEnter = (event) => {
  if (event.key === "Enter") {
    addTask();
  }
};

const addTask = async () => {
  if (!value) {
    alert("Введите текст!");
    return;
  }
  if (edit) {
    alert("Отредактируйте!");
    return;
  }

  const response = await fetch("http://localhost:8000/createTask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      text: value,
      isCheck: false,
    }),
  });

  let result = await response.json();
  allTask = result.data;
  value = null;
  input.value = null;
  render();
};

const sortArr = () => {
  allTask.sort((a, b) => a.isCheck - b.isCheck);
};

const render = () => {
  const content = document.getElementById("content_page");

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  sortArr();

  localStorage.setItem("tasks", JSON.stringify(allTask));

  allTask.forEach((element, index) => {
    const container = document.createElement("div");
    container.id = `task-${index}`;
    container.className = "task_container";
    const checkbox = document.createElement("input");
    checkbox.className = "checkInput";
    checkbox.type = "checkbox";
    checkbox.checked = element.isCheck;
    checkbox.onchange = () => onChangeCheck(index);
    container.appendChild(checkbox);

    const text = document.createElement("p");
    text.innerText = element.text;
    text.className = element.isCheck ? "text_task done_task" : "text_task";
    container.appendChild(text);

    if (!allTask[index].isCheck) {
      const editButton = document.createElement("img");
      editButton.src = "img/edit_2.png";
      editButton.className = "img_edit";
      editButton.onclick = () => EditTask(index);
      container.appendChild(editButton);
    }

    const deleteButton = document.createElement("img");
    deleteButton.src = "img/close.png";
    deleteButton.className = "img_close";
    deleteButton.onclick = () => DeleteTask(index);

    container.appendChild(deleteButton);
    content.appendChild(container);
  });
};

const onChangeCheck = async (index) => {
  let { id, isCheck } = allTask[index];
  isCheck = !isCheck;

  const response = await fetch("http://localhost:8000/updateTask", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      id,
      isCheck,
    }),
  });

  let result = await response.json();
  allTask = result.data;
  render();
};

const DeleteTask = async (index) => {
  if (edit) {
    alert("Отредактируйте!");
    return;
  }

  const response = await fetch(
    `http://localhost:8000/deleteTask?id=${allTask[index].id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  let result = await response.json();
  allTask = result.data;

  render();
};

const EditTask = async (index) => {
  const text = document.querySelectorAll(".text_task")[index];
  const input = document.createElement("input");
  const textReplace = document.createElement("p");
  const imgEdit = document.querySelectorAll(".img_edit")[index];
  const imgDelete = document.querySelectorAll(".img_close")[index];
  const inputReplace = document.getElementById("inputReplace");
  const checkbox2 = document.querySelectorAll(".checkInput");

  if (edit) {
    if (checkItem != index) {
      alert("Отредактируйте!");
      return;
    }
    textReplace.innerText = inputReplace.value;
    allTask[index].text = inputReplace.value;
    let { id, text } = allTask[index];

    const response = await fetch("http://localhost:8000/updateTask", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        id,
        text,
      }),
    });

    textReplace.className = "text_task";
    inputReplace.replaceWith(textReplace);

    imgEdit.src = "img/edit_2.png";
    imgDelete.style.display = "block";
    edit = false;

    checkbox2.forEach((element) => {
      if (!element.checked) {
        element.disabled = false;
      }
    });
  } else {
    imgEdit.src = "img/done.png";
    imgDelete.style.display = "none";

    input.id = "inputReplace";
    input.value = allTask[index].text;
    text.replaceWith(input);
    edit = true;
    checkItem = index;

    checkbox2.forEach((element) => {
      if (!element.checked) {
        element.disabled = true;
        element.checked = false;
      }
    });
  }
};
