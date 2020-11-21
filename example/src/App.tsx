import React from 'react';

import {createRrs } from '@bluebird/react-rest-store';

const { Provider, domain } = createRrs({
  domain: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
});

const Todos = () => {
  const a = domain.useGet('/todos');

  console.log(a);
  const { data: todos, loading } = a;
  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        {todos.map((todo: any) => (
          <tr key={todo.id}>
            <td>{todo.title}</td>
            <td>{todo.completed && 'X'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const App = () => (
  <Provider>
    <Todos />
  </Provider>
)

export default App
