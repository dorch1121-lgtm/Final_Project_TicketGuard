function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="auth-page-header">
      <div>
        {eyebrow}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
