import React from 'react';

import {createRrs } from 'react-rest-store';

const { Provider, domain } = createRrs({
  domain: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
});

const Todos = () => {
  const { data: todos, loading } = domain.useGet('/todos');

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
};

const App = () => (
  <Provider>
    <Todos />
  </Provider>
);

export default App;