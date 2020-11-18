import "bootstrap/dist/css/bootstrap.css";
import buildClient from "./../api/buildClient";
import Header from "../components/header";

const appComponent = ({ Component, pageProps, data }) => {
  return (
    <div>
      <Header currentUser={data} />

      <div className="container">
        <Component currentUser={data} {...pageProps} />
      </div>
    </div>
  );
};

appComponent.getInitialProps = async (appContext) => {
  const middleClient = buildClient(appContext.ctx);
  const { data } = await middleClient.get("/api/users/currentuser");

  let pageProps = {};
  //Enable pages to call getInitialProps
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      middleClient,
      data.currentUser
    );
  }
  console.log(pageProps);
  return { pageProps, ...data };
};

export default appComponent;
