import React from 'react';

import { createRrs } from 'react-rest-store';

const { Provider, domain, useLocal } = createRrs({
  domain: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
});

function useCounter() {
  return useLocal('counter', 0);
}

const Todos = () => {
  const { data: todos, loading } = domain.useGet('/todos');
  const { data: counter, dispatch } = useCounter();

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      Local counter: {counter}
      <button type="button" style={{ marginLeft: 10 }} onClick={() => dispatch(counter + 1)}>+1</button>
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
    </div>
  );
};

const App = () => (
  <Provider>
    <Todos />
  </Provider>
);

export default App;