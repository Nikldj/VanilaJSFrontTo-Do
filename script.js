let allTask_2 = [];
let allTask = [];
let input = null;
let value = '';
let edit = false;
let index_el = 0;
let check_index = false;

window.onload = async function init() {
  input = document.getElementById('input_task');
  input.addEventListener('change', UpdateValue)
  const response = await fetch('http://localhost:8000/allTasks', {
    method: 'GET'
  });
  let result = await response.json();
  allTask = result.data;
  render();
}
onClickButton = async () => {

  if (value == "") {
    alert("Введите значение!")
  } else {
    if (check_index == false) {
      allTask.push({
        text: value,
        isCheck: false,
      });


      const response = await fetch('http://localhost:8000/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          text: value,
          isCheck: false,
        })
      });
      let result = await response.json();
      allTask = result.data;
      console.log("allTask", allTask);

      value = '';
      input.value = null;
      render();
    } else {
      alert('Отредактируйте!')
    }
  }
}

const UpdateValue = (elem) => {
  value = elem.target.value;
}

const sortArr = () =>{
  allTask_2 = [];
  for (let i = 0; i < allTask.length; i++) {
    if (allTask[i].isCheck == true) {
      allTask_2.push(allTask[i]);
      delete allTask[i];
    }
  }
  allTask = allTask.filter(task => task.isCheck == false)
  localStorage.setItem('tasks', JSON.stringify(allTask));
  for (let i = 0; i < allTask_2.length; i++) {
    if (allTask_2[i].isCheck == true) {
      allTask.push(allTask_2[i]);
    }
  }
  console.log(allTask);
}

const render = () => {
  const content = document.getElementById('content_page');
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  sortArr();

  localStorage.setItem('tasks', JSON.stringify(allTask));


  allTask.forEach((element, index) => {

    const container = document.createElement('div');
    container.id = `task-${index}`;
    container.className = 'task_container';
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = element.isCheck;

    checkbox.onchange = function () {
      if (onChangeCheck(index)) {
        checkbox.checked = false;
      }
    }
    container.appendChild(checkbox);

    const text = document.createElement('p');
    text.innerText = element.text;
    text.className = element.isCheck ? "text_task done_task" : "text_task"
    container.appendChild(text);

    const img = document.createElement('img');
    img.src = 'img/edit_2.png';
    img.className = 'img_edit';
    img.onclick = function () {
      EditTask(index);
    }
    if (!allTask[index].isCheck) {
      container.appendChild(img);
    }


    const img_2 = document.createElement('img');
    img_2.src = 'img/close.png';
    img_2.className = 'img_close';
    img_2.onclick = function () {
      DeleteTask(index);
    }
    container.appendChild(img_2);
    content.appendChild(container);
  });
}

const onChangeCheck = async (index) => {
  if (check_index == false) {
    allTask[index].isCheck = !allTask[index].isCheck;

    const response = await fetch('http://localhost:8000/updateTask', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        id: allTask[index].id,
        text: allTask[index].text,
        isCheck: allTask[index].isCheck,
      })
    });
    let result = await response.json();
    allTask = result.data;
    localStorage.setItem('tasks', JSON.stringify(allTask));
    render();
  } else {
    alert('Отредактируйте');
    return true;
  }

}

const DeleteTask = async (index) => {
  if (check_index == false) {


    const response = await fetch(`http://localhost:8000/deleteTask?id=${allTask[index].id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
    });
    let result = await response.json();
    allTask = result.data;

    localStorage.setItem('tasks', JSON.stringify(allTask));
    render();
  } else {
    alert('Отредактируйте!')
  }

}

const EditTask = async (index) => {
  const img_2 = document.querySelectorAll('.img_edit')[index];
  const img_3 = document.querySelectorAll('.img_close')[index];
  if (edit) {
    const input = document.getElementById('input_replace');
    const text = document.createElement('p');
    text.className = "text_task";
    if (!input.value) {
      alert("Введите значение!")
    }
    else {
      if (index_el != index) {
        alert('Отредактируйте!');
      } else {
        text.innerText = input.value;
        allTask[index].text = input.value;

        const response = await fetch('http://localhost:8000/updateTask', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            id: allTask[index].id,
            text: input.value,
            isCheck: allTask[index].isCheck,
          })
        });

        let result = await response.json();
        allTask = result.data;
        localStorage.setItem('tasks', JSON.stringify(allTask));

        input.replaceWith(text);
        edit = false;
        img_2.src = 'img/edit_2.png';
        img_3.style.display = 'block';
        check_index = false;
      }
    }
  } else {
    const text = document.querySelectorAll('.text_task')[index];
    const input = document.createElement('input');
    img_2.src = 'img/done.png';
    img_3.style.display = 'none';
    input.id = 'input_replace';
    input.value += text.innerText;
    text.replaceWith(input);
    edit = true;
    index_el = index;
    check_index = true;
  }
}