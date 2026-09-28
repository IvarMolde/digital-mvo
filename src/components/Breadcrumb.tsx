interface Item {
  label: string;
  onClick?: () => void;
}

export function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <nav aria-label="Du er her" className="breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={i}>
            {item.onClick ? (
              <button type="button" onClick={item.onClick}>
                {item.label}
              </button>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
