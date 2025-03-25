export default function searchTaskName(tasks,searchText){
    if(!searchText) return tasks;
    else{
        const result = tasks.filter((task) => 
            task.taskTitle?.toLowerCase().includes(searchText.toLowerCase()));
        return result;
    }
      
}